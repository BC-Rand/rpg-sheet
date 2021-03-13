import { Injectable } from '@angular/core';
import { Character, ClassBundle, RaceBundle, BackgroundBundle, Trait, AbilityBundle, SkillProficiency, Equipment, SavingThrows, AbilityNames, SkillProficiencies } from './types/character';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { CollectionApiResult, SimpleApiResult } from './types/results';
import { APIService } from './api.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  
  private character: Character;

  private classBundle: ClassBundle;
  private raceBundle: RaceBundle;
  private backgroundBundle: BackgroundBundle;
  private abilityBundle: AbilityBundle;

  private raceTraits: Trait[] = [];
  private backgroundTrait: Trait;

  public simpleClassesObs$: BehaviorSubject<CollectionApiResult> = new BehaviorSubject<CollectionApiResult>(null);
  public simpleRacesObs$: BehaviorSubject<CollectionApiResult> = new BehaviorSubject<CollectionApiResult>(null);

  public classObs$: BehaviorSubject<ClassBundle> = new BehaviorSubject<ClassBundle>(null);
  public raceObs$: BehaviorSubject<RaceBundle> = new BehaviorSubject<RaceBundle>(null);
  public backgroundObs$: BehaviorSubject<BackgroundBundle> = new BehaviorSubject<BackgroundBundle>(null);
  public abilitiesObs$: BehaviorSubject<AbilityBundle> = new BehaviorSubject<AbilityBundle>(null);

  public characterObs$: BehaviorSubject<Character> = new BehaviorSubject<Character>(null);
  
  constructor(
    private _router: Router,
    private _api: APIService
  ) {
    this._api.getClasses().pipe(
      take(1)
    ).subscribe(
      result => {
        this.simpleClassesObs$.next(result);
      },
      error => {
        console.error(error);
      }
    )
    this._api.getRaces().pipe(
      take(1)
    ).subscribe(
      result => {
        this.simpleRacesObs$.next(result);
      },
      error => {
        console.error(error);
      }
    );
    this.classObs$.pipe(
      filter(data => !!data)
    ).subscribe(classBundle => {
      this.classBundle = classBundle
      this._api.getClassLevels(classBundle.class.class_levels).pipe(
        take(1)
      ).subscribe(
        result => {
          // Removes subclass choices from class levels
          for (let i=0; i<result.length; i++) {
            if (result[i].hasOwnProperty('subclass')) {
              result.splice(i, 1);
              i--;
            }
          }
          classBundle.classLevels = result;
        },
        error => {
          console.error(error);
        }
      )
    });
    this.raceObs$.pipe(
      filter(data => !!data)
    ).subscribe(raceBundle => {
      this.raceBundle = raceBundle;
      this.raceTraits = [];
      this.raceBundle.race.traits.forEach(trait => {
        this._api.getTrait(trait.url).subscribe(result => {
          this.raceTraits.push({
            name: result.name,
            description: result.desc[0],
            source: "Race"
          })
        })
      })
    });
    this.backgroundObs$.pipe(
      filter(data => !!data)
    ).subscribe(backgroundBundle => {
      this.backgroundBundle = backgroundBundle;
      this.backgroundTrait = this.backgroundBundle.background.trait;
    });
    this.abilitiesObs$.pipe(
      filter(data => !!data)
    ).subscribe(abilityBundle => {
      this.abilityBundle = abilityBundle;
    });
    this.characterObs$.pipe(
      filter(data => !!data)
    ).subscribe(character =>{
      this.character = character;
      this.character.traits = [];
      this.raceTraits.forEach(trait => {
        this.character.traits.push(trait)
      });
      this.character.traits.push(this.backgroundTrait);
    })
  }

  navigateCreate() {
    let route = !!this.classBundle ? !!this.raceBundle ? !!this.backgroundBundle ? "NONEED" : "create/background" : "create/race" : "create/class" 
    if (route !== "NONEED") {
      this._router.navigate([route]);
    }
  }

  hasClass() {
    return !!this.classBundle
  }

  hasRace() {
    return !!this.raceBundle
  }

  hasBackground() {
    return !!this.backgroundBundle
  }

  storeCharacter(character: Character) {
    this.character = character
  }

  getCharacter(): Character {
    return this.character
  }

  createCharacter(): boolean {
    if (this.classBundle && this.raceBundle && this.backgroundBundle && this.abilityBundle) {
      let skillProficiencies: SkillProficiency[] = [];
      let proficiencies: SimpleApiResult[] = [];
      let inventory: Equipment[] = [];

      // Put all proficiencies from class, race, and background into their appropriate array
      this.classBundle.skillProficiencies.forEach(
        skillProficiency => {
          skillProficiencies.push(skillProficiency);
        }
      );
      this.classBundle.classProficiencies.forEach(
        proficiency => {
          proficiencies.push({
            index: proficiency.index,
            name: proficiency.name,
            url: proficiency.url
          });
        }
      );
      this.raceBundle.startingProficiencyChoices.forEach(
        proficiency => {
          proficiencies.push({
            index: proficiency.index,
            name: proficiency.name,
            url: proficiency.url
          })
        }
      );
      this.raceBundle.skillProficiencyChoices.forEach(
        proficiency => {
          skillProficiencies.push(proficiency);
        }
      )
      this.raceBundle.race.starting_proficiencies.forEach(
        proficiency => {
          if (proficiency.name.substr(0,7) == "Skill: ") {
            skillProficiencies.push({
              proficient: true,
              name: proficiency.name.substr(7),
              source: "Race"
            })
          } else {
            proficiencies.push(proficiency)
          }
          
        }
      )
      this.backgroundBundle.background.proficiencies.forEach(
        skillProficiency => {
          skillProficiencies.push(skillProficiency);
        }
      );

      // Get appropriate saving throws
      let savingThrows: SavingThrows = {
        strength: false,
        dexterity: false,
        constitution: false,
        wisdom: false,
        intelligence: false,
        charisma: false
      }
      this.classBundle.class.saving_throws.forEach(
        savingThrow => {
          savingThrows[AbilityNames[savingThrow.index as keyof typeof AbilityNames]] = true;
        }
      )

      // Put all inventory arrays into a single array
      inventory = this.classBundle.inventory.concat(this.backgroundBundle.background.equipment);

      // Calculate constitution modifier for use in calculating hit points
      let constitutionMod = Math.floor((this.abilityBundle.stats.constitution-10)/2)
      if (constitutionMod < 1) {
        constitutionMod = 1;
      }

      let newCharacter: Character = {
        name: this.backgroundBundle.name,
        class: this.classBundle.class,
        classLevels: this.classBundle.classLevels,
        race: this.raceBundle.race,
        background: this.backgroundBundle.background,
        level: 1,
        hitPoints: {
          total: this.classBundle.class.hit_die + constitutionMod,
          current: this.classBundle.class.hit_die + constitutionMod
        },
        hitPointsBase: {
          constitutionModTotal: constitutionMod,
          perLevelTotal: this.classBundle.class.hit_die
        },
        hitDice: {
          total: 1,
          current: 1
        },
        baseStats: this.abilityBundle.baseStats,
        stats: this.abilityBundle.stats,
        savingThrows: savingThrows,
        proficiencies: proficiencies,
        skill_proficiencies: {
            acrobatics: {
              proficient: false,
              name: 'Acrobatics',
              source: 'None',
              stat: 'dexterity'
            },
            animal_handling: {
              proficient: false,
              name: 'Animal Handling',
              source: 'None',
              stat: 'wisdom'
            },
            arcana: {
              proficient: false,
              name: 'Arcana',
              source: 'None',
              stat: 'intelligence'
            },
            athletics: {
              proficient: false,
              name: 'Athletics',
              source: 'None',
              stat: 'strength'
            },
            deception: {
              proficient: false,
              name: 'Deception',
              source: 'None',
              stat: 'charisma'
            },
            history: {
              proficient: false,
              name: 'History',
              source: 'None',
              stat: 'intelligence'
            },
            insight: {
              proficient: false,
              name: 'Insight',
              source: 'None',
              stat: 'wisdom'
            },
            intimidation: {
              proficient: false,
              name: 'Intimidation',
              source: 'None',
              stat: 'charisma'
            },
            investigation: {
              proficient: false,
              name: 'Investigation',
              source: 'None',
              stat: 'intelligence'
            },
            medicine: {
              proficient: false,
              name: 'Medicine',
              source: 'None',
              stat: 'wisdom'
            },
            nature: {
              proficient: false,
              name: 'Nature',
              source: 'None',
              stat: 'intelligence'
            },
            perception: {
              proficient: false,
              name: 'Perception',
              source: 'None',
              stat: 'wisdom'
            },
            performance: {
              proficient: false,
              name: 'Performance',
              source: 'None',
              stat: 'charisma'
            },
            persuasion: {
              proficient: false,
              name: 'Persuasion',
              source: 'None',
              stat: 'charisma'
            },
            religion: {
              proficient: false,
              name: 'Religion',
              source: 'None',
              stat: 'intelligence'
            },
            sleight_of_hand: {
              proficient: false,
              name: 'Sleight of Hand',
              source: 'None',
              stat: 'dexterity'
            },
            stealth: {
              proficient: false,
              name: 'Stealth',
              source: 'None',
              stat: 'dexterity'
            },
            survival: {
              proficient: false,
              name: 'Survival',
              source: 'None',
              stat: 'wisdom'
            }
        },
        inventory: inventory,
        armorClass: 10,
        traits: null,
        spells: null,
        languages: null
      }

      skillProficiencies.forEach(
        skillProficiency => {
          let key = skillProficiency.name.toLowerCase().replace(/ /g, '_') as keyof SkillProficiencies;
          console.log(key);
          newCharacter.skill_proficiencies[key].proficient = skillProficiency.proficient;
          newCharacter.skill_proficiencies[key].source = skillProficiency.source;
        }
      )
      
      // Send the character through the character behavior subject
      this.characterObs$.next(newCharacter);
      
      return true;
    } else {
      return false;
    }
  }
}
