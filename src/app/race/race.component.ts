import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { APIService } from '../api.service';
import { CharacterService } from '../character.service';

import { RaceBundle, SkillProficiencies, SkillProficiency, Trait } from '../types/character';
import { AbilityBonusResult, ChooseFrom, RaceResult, SimpleApiResult, SimpleChoiceResult } from '../types/results';

@Component({
  selector: 'app-race',
  templateUrl: './race.component.html',
  styleUrls: [
    '../shared-styles/class-race.css',
    '../shared-styles/create.css'
  ]
})
export class RaceComponent implements OnInit {

  // Options for the select element
  public races: SimpleApiResult[] = [];

  // String bound to the race select element
  public raceSelect: string = "";

  // API Race result
  public selectedRace: RaceResult;

  // State object
  public choiceState = {
    traitOptions: {
      current: 0,
      error: false
    },
    startingProficiency: {
      current: 0,
      error: false
    },
    abilityBonus: {
      current: 0,
      error: false
    },
    language: {
      current: 0,
      error: false
    }
  };

  // Proficiencies to be filtered out
  public filterSkillProficiencies: Array<SkillProficiency> = [];

  constructor(
    private _router: Router,
    private _api: APIService,
    private _character: CharacterService) { }

  ngOnInit(): void {
    // Redirects back if class not complete
    if (!this._character.hasClass()) {
      this.previousComponent();
    } else {
      // Populates the list of available races
      this._character.simpleRacesObs$.pipe(
        filter(data => !!data),
        take(1)
      ).subscribe(
        result => {
          this.races = result.results;
        }
      )
      
      // Repopulates the race when returning to the component
      this._character.raceObs$.pipe(
        filter(data => !!data),
        take(1)
      ).subscribe(
        raceBundle => {
          this.raceSelect = raceBundle.race.url
          this.selectedRace = raceBundle.race
        }
      )
  
      // Gets selected Class information to filter proficiencies
      this._character.classObs$.subscribe(result => {
        this.filterSkillProficiencies = result.skillProficiencies;
      })
    }

  }

  // Filtering Function
  filterProficiency(proficiency: SimpleChoiceResult) {
    for (let i=0; i<this.filterSkillProficiencies.length; i++) {
      if (this.filterSkillProficiencies[i].name == proficiency.name.substr(7)) {
        return true;
      }
    }
    return false;
  }
  // Filtering Function


  // Resets the error object
  resetErrors() {
    this.choiceState = {
      traitOptions: {
        current: 0,
        error: false
      },
      startingProficiency: {
        current: 0,
        error: false
      },
      abilityBonus: {
        current: 0,
        error: false
      },
      language: {
        current: 0,
        error: false
      }
    };
  }

  // Gets a race from the API
  getRace(raceUrl : string) {
    this._api.getRace(raceUrl).pipe(
      take(1)
    ).subscribe(
      result => {
        console.log(result);
        this.resetErrors();
        // Check for starting proficiency that overlaps with a selected class proficiency
        
        // Check for starting proficiency that overlaps with a selected class proficiency
        this.selectedRace = result;
      },
      error => {
        console.error(error);
      }
    )
  }

  previousComponent() {
    this._router.navigate(["create/class"])
  }

  labelClick(chooseNumber: number, state: {current:number,error:boolean}, object:any) {
    this.checkboxClick(chooseNumber, state, object);
    object.choose = !object.choose;
  }
  checkboxClick(chooseNumber: number, state: {current:number,error:boolean}, object:any) {
    let number = object.choose ? -1 : 1;
    state.current += number;
    state.error = !(state.current == chooseNumber);
  }

  chooseRace(): Boolean {
    if (this.selectedRace != undefined) {
      let abilityBonusChoices: AbilityBonusResult[] = [];
      if (this.selectedRace.hasOwnProperty("ability_bonus_options") && this.selectedRace.ability_bonus_options != undefined) {
        this.selectedRace.ability_bonus_options.from.forEach(
          option => {
            if (option.choose) {
              abilityBonusChoices.push(option);
            }
          }
        )
        this.choiceState.abilityBonus.error = !(abilityBonusChoices.length == this.selectedRace.ability_bonus_options.choose);
      }
      if (this.selectedRace.hasOwnProperty("trait_options") && this.selectedRace.trait_options != undefined) {
        let chosenTrait: SimpleApiResult = {
          index: "",
          name: "",
          url: "",
        };
        let spliceIndex: number = 0;
        let count: number = 0;
        this.selectedRace.trait_options.from.forEach(
          (traitChoice: SimpleChoiceResult, i : number) => {
            if (traitChoice.choose) {
              chosenTrait = {
                index: traitChoice.index,
                name: traitChoice.name,
                url: traitChoice.url
              }
              spliceIndex = i;
              count++;
            }
          }
        );
        this.choiceState.traitOptions.error = !(count == this.selectedRace.trait_options.choose);
        if (!this.choiceState.traitOptions.error) {
          this.selectedRace.traits.splice(spliceIndex, 1, chosenTrait);
        }
      }
      let startingProficiencyChoices: SimpleChoiceResult[] = [];
      let skillProficiencyChoices: SkillProficiency[] = [];
      let skillBoolean: Boolean = false;
      if (this.selectedRace.hasOwnProperty("starting_proficiency_options") && this.selectedRace.starting_proficiency_options != undefined) {
        skillBoolean = this.selectedRace.starting_proficiency_options.from[0].name.substr(0,7) == "Skill: ";
        this.selectedRace.starting_proficiency_options.from.forEach(
          proficiencyChoice => {
            if (proficiencyChoice.choose) {
              skillBoolean? skillProficiencyChoices.push({proficient:true,name:proficiencyChoice.name.substr(7),source:"Race"}) : startingProficiencyChoices.push(proficiencyChoice)
            }
          }
        )
        this.choiceState.startingProficiency.error = !((skillBoolean ? skillProficiencyChoices : startingProficiencyChoices).length == this.selectedRace.starting_proficiency_options.choose);  
      }
      let languageChoices: SimpleChoiceResult[] = [];
      if (this.selectedRace.hasOwnProperty("language_options") && this.selectedRace.language_options != undefined) {
        this.selectedRace.language_options.from.forEach(
          option => {
            if (option.choose) {
              languageChoices.push(option);
            }
          }
        )
        this.choiceState.language.error = !(languageChoices.length == this.selectedRace.language_options.choose);
        
      }
      if (!this.choiceState.traitOptions.error && !this.choiceState.startingProficiency.error && !this.choiceState.abilityBonus.error && !this.choiceState.language.error) {
        this._character.raceObs$.next({
          abilityBonusChoices: abilityBonusChoices,
          startingProficiencyChoices: startingProficiencyChoices,
          skillProficiencyChoices: skillProficiencyChoices,
          languageChoices: languageChoices,
          race: this.selectedRace
        });
        this._router.navigate(["create/background"])
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
}
