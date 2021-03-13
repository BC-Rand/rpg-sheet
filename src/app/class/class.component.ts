import { Component, OnInit } from '@angular/core';

import { Equipment, SkillProficiency  } from '../types/character';
import { ClassResult, SimpleApiResult, SimpleChoiceResult } from '../types/results'
import { APIService } from "../api.service";
import { filter, take } from "rxjs/operators";
import { CharacterService } from '../character.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: [
    '../shared-styles/class-race.css',
    '../shared-styles/create.css'
  ]
})
export class ClassComponent implements OnInit {

  // Options for the select element
  public classes: SimpleApiResult[] = [];

  // String bound to the class select element
  public classSelect: string = "";

  // API Class result
  public selectedClass: ClassResult;
  
  //API Class level table result
  public classLevels: any[]

  // Error boolean
  public choiceError: boolean = false;

  // ChooseFrom States
  public proficiencyStates = [
    {
      current: 0,
      error: false
    },
    {
      current: 0,
      error: false
    },
    {
      current: 0,
      error: false
    }
  ];
  public equipmentStates = [
    {
      current: 0,
      error: false
    },
    {
      current: 0,
      error: false
    },
    {
      current: 0,
      error: false
    }
  ]

  constructor(
    private _api: APIService,
    private _character: CharacterService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    // Populates the list of available classes
    this._character.simpleClassesObs$.pipe(
      filter(data => !!data),
    ).subscribe(
      result => {
        this.classes = result.results;
      }
    )

    // Repopulates the class when returning to the component
    this._character.classObs$.pipe(
      filter(data => !!data),
      take(1)
    ).subscribe(
      result => {
        this.classSelect = result.class.url
        this.selectedClass = result.class
      }
    )

  }

  // Gets a class from the API
  getClass(classUrl: string): void {
    this._api.getClass(classUrl).pipe(
      take(1)
    ).subscribe(
      result => {
        this.resetErrors();
        this.selectedClass = result;
        console.log(this.selectedClass);
      },
      error => {
        console.error(error);
      }
    )
  }

  // Resets the error array and state objects
  resetErrors() {
    this.proficiencyStates = [
      {
        current: 0,
        error: false
      },
      {
        current: 0,
        error: false
      },
      {
        current: 0,
        error: false
      }
    ];
    this.equipmentStates = [
      {
        current: 0,
        error: false
      },
      {
        current: 0,
        error: false
      },
      {
        current: 0,
        error: false
      }
    ]
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

  chooseClass(): Boolean {
    if (this.selectedClass != undefined) {
      let skillProficiencies: Array<SkillProficiency> = [];
      let classProficiencies: Array<SimpleChoiceResult> = [];
      let inventory: Array<Equipment> = [];
      this.choiceError = false;
      this.selectedClass.proficiency_choices.forEach((proficiencyChoices, i) => {
        
        let skill: Boolean = (proficiencyChoices.from[0].name.substr(0,7) == "Skill: ")
        let count: number = 0;
        proficiencyChoices.from.forEach(proficiency => {
          if (proficiency.choose) {
            if (skill) {
              skillProficiencies.push({
                proficient: true,
                name: proficiency.name.substr(7),
                source: "Class"
              });
            } else {
              classProficiencies.push(proficiency)
            }
            count++;
          }
        });
        if (count != proficiencyChoices.choose) {
          console.log("ERROR WITH # OF CHOICES")
          this.choiceError = true;
          this.proficiencyStates[i].error = true;
        } else {
          this.proficiencyStates[i].error = false;
        }
      });
      this.selectedClass.custom_equipment_options.forEach((equipmentChoices, i) => {
        let count: number = 0;
        equipmentChoices.from.forEach(equipment => {
          if (equipment.choose) {
            inventory.push({
              name: equipment.name,
              index: equipment.index,
              description: "",
              quantity: 1,
              url: equipment.url
            });
            count++;
          }
        })
        if (count != equipmentChoices.choose) {
          this.choiceError = true;
          this.equipmentStates[i].error = true;
        } else {
          this.equipmentStates[i].error = false;
        }
      })
      if (!this.choiceError) {
        this.selectedClass.starting_equipment.forEach(equipment => {
          inventory.push({
            name: equipment.equipment.name,
            index: equipment.equipment.index,
            description: "",
            quantity: equipment.quantity,
            url: equipment.equipment.url
          })
        })
        this._character.classObs$.next({
          class: this.selectedClass,
          skillProficiencies: skillProficiencies,
          classProficiencies: classProficiencies,
          classLevels: [],
          inventory: inventory
        });
        this._router.navigate(["/create/race"]);
        return true;
      } else {
        console.log("CHOICE ERROR IS TRUE");
        return false;
      }
    }
    return false;
  }
}
