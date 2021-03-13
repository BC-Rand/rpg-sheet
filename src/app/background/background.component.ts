import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { CharacterService } from '../character.service';

import { Equipment, SkillProficiencies, SkillProficiency, Trait } from '../types/character';
import { SimpleApiResult, SimpleChoiceResult } from '../types/results';


@Component({
  selector: 'app-background',
  templateUrl: './background.component.html',
  styleUrls: [
    './background.component.css',
    '../shared-styles/create.css'
  ]
})
export class BackgroundComponent implements OnInit {

  public characterName: string = "";
  public backgroundName: string = "";
  public backgroundTrait: Trait = {
    name: '',
    description: '',
    source: 'Background'
  }
  public backgroundEquipment: Equipment[] = [
    {
      name: "",
      description: "",
      index: "",
      quantity: 1,
      url: ""
    }
  ]

  private classProficiencies: SkillProficiency[] = [];
  private raceProficiencies: SkillProficiency[] = []
  private raceStartingProficiencies: SimpleApiResult[] = [];

  public backgroundProficiencies: SkillProficiencies = {
    acrobatics: {
      name:'Acrobatics',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    animal_handling: {
      name:'Animal Handling',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    arcana: {
      name:'Arcana',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    athletics: {
      name:'Athletics',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    deception: {
      name:'Deception',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    history: {
      name:'History',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    insight: {
      name:'Insight',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    intimidation: {
      name:'Intimidation',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    investigation: {
      name:'Investigation',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    medicine: {
      name:'Medicine',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    nature: {
      name:'Nature',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    perception: {
      name:'Perception',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    performance: {
      name:'Performance',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    persuasion: {
      name:'Persuasion',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    religion: {
      name:'Religion',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    sleight_of_hand: {
      name:'Sleight of Hand',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    stealth: {
      name:'Stealth',
      proficient: false,
      source: 'Background',
      disabled: false
    },
    survival: {
      name:'Survival',
      proficient: false,
      source: 'Background',
      disabled: false
    }
  }

  constructor(
    private _router: Router,
    private _character: CharacterService
  ) { }

  ngOnInit(): void {
    if (!this._character.hasRace()) {
      this._character.navigateCreate();
    } else {
      this._character.backgroundObs$.pipe(
        filter(data => !!data),
        take(1)
      ).subscribe(backgroundBundle => {
        this.characterName = backgroundBundle.name
        this.backgroundName = backgroundBundle.background.name
        this.backgroundTrait = backgroundBundle.background.trait
      });
      this._character.classObs$.subscribe(classBundle => {
        this.classProficiencies = classBundle.skillProficiencies
      });
      this._character.raceObs$.subscribe(raceBundle => {
        if (raceBundle.race.starting_proficiencies.length > 0 && raceBundle.race.starting_proficiencies[0].name.substr(0,7) == "Skill: ") {
          this.raceStartingProficiencies = raceBundle.race.starting_proficiencies;
        }
        this.raceProficiencies = raceBundle.skillProficiencyChoices
        this.filterProficiencies();
      });
    }
  }

  filterProficiencies() {
    // Inelegant solution
    this.backgroundProficiencies = {
      acrobatics: {
        name:'Acrobatics',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      animal_handling: {
        name:'Animal Handling',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      arcana: {
        name:'Arcana',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      athletics: {
        name:'Athletics',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      deception: {
        name:'Deception',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      history: {
        name:'History',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      insight: {
        name:'Insight',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      intimidation: {
        name:'Intimidation',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      investigation: {
        name:'Investigation',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      medicine: {
        name:'Medicine',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      nature: {
        name:'Nature',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      perception: {
        name:'Perception',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      performance: {
        name:'Performance',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      persuasion: {
        name:'Persuasion',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      religion: {
        name:'Religion',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      sleight_of_hand: {
        name:'Sleight of Hand',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      stealth: {
        name:'Stealth',
        proficient: false,
        source: 'Background',
        disabled: false
      },
      survival: {
        name:'Survival',
        proficient: false,
        source: 'Background',
        disabled: false
      }
    }
    // Inelegant solution
    console.log("filtering the proficiencies in background")
    this.classProficiencies.forEach(proficiency => {
      let key: keyof SkillProficiencies = proficiency.name.toLowerCase().replace(/ /g, "_") as keyof SkillProficiencies;
      this.backgroundProficiencies[key].disabled = true;
    })
    this.raceProficiencies.forEach(proficiency => {
      let key: keyof SkillProficiencies = proficiency.name.toLowerCase() as keyof SkillProficiencies
      console.log(key);
      this.backgroundProficiencies[key].disabled = true;
    });
    this.raceStartingProficiencies.forEach(proficiency => {
      let key: keyof SkillProficiencies = proficiency.name.substr(7).toLowerCase().replace(/ /g, "_") as keyof SkillProficiencies
      this.backgroundProficiencies[key].disabled = true;
    })
  }

  filterHelper(boolean: boolean | undefined) {
    return boolean as boolean;
  }

  chooseBackground(): Boolean {
    let proficiencies : Array<SkillProficiency> = [];

    for (const key in this.backgroundProficiencies) {
      if (this.backgroundProficiencies[key as keyof SkillProficiencies].proficient == true) {
        proficiencies.push(this.backgroundProficiencies[key as keyof SkillProficiencies])
      }
    }
    for (let i=0; i < this.backgroundEquipment.length; i++) {
      if (this.backgroundEquipment[i].name == "" ||  this.backgroundEquipment[i].quantity < 1) {
        let spliced = this.backgroundEquipment.splice(i, 1);
        i--;
      }
    }
    this._character.backgroundObs$.next(
      {
        name: this.characterName,
        background: {
          name: this.backgroundName,
          trait: this.backgroundTrait,
          proficiencies: proficiencies,
          equipment: this.backgroundEquipment
        }
      }
      
    )
    this._router.navigate(["create/abilities"]);
    return true;
  }

  previousComponent() {
    this._router.navigate(["create/race"]);
  }

  deleteItem(index: number) {
    this.backgroundEquipment.splice(index, 1);
  }

  addItem() {
    this.backgroundEquipment.push(
      {
        name: "",
        description: "",
        index: "",
        quantity: 1,
        url: ""
      }
    )
  }
}