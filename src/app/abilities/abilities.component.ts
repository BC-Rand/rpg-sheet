import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CharacterService } from '../character.service';
import { AbilityNames, AbilityScores } from '../types/character';
import { AbilityBonusResult } from '../types/results';

@Component({
  selector: 'app-abilities',
  templateUrl: './abilities.component.html',
  styleUrls: [
    './abilities.component.css',
    '../shared-styles/create.css'
  ]
})
export class AbilitiesComponent implements OnInit {

  public keys: Array<keyof AbilityScores> = ["strength", "dexterity", "constitution", "wisdom", "intelligence", "charisma"]

  public abilityScores: AbilityScores = {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    wisdom: 0,
    intelligence: 0,
    charisma: 0
  }

  public errors = {
    strength: false,
    dexterity: false,
    constitution: false,
    wisdom: false,
    intelligence: false,
    charisma: false
  }

  public abilityBonuses: AbilityScores = {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    wisdom: 0,
    intelligence: 0,
    charisma: 0
  }

  constructor(
    private _router: Router,
    private _character: CharacterService
  ) { }

  ngOnInit(): void {
    if (!this._character.hasBackground()) {
      this._character.navigateCreate();
    } else {
      this._character.raceObs$.subscribe(raceBundle => {
        let bonuses = raceBundle.race.ability_bonuses.concat(raceBundle.abilityBonusChoices)
        bonuses.forEach(bonus => {
          let map: string = AbilityNames[bonus.ability_score.index as keyof typeof AbilityNames]
          this.abilityBonuses[map as keyof AbilityScores] = bonus.bonus;
        })
        console.log(this.abilityBonuses);
      });
    }
  }

  resetErrors() {
    this.errors = {
      strength: false,
      dexterity: false,
      constitution: false,
      wisdom: false,
      intelligence: false,
      charisma: false
    }
  }

  randomize() {
    this.keys.forEach(
      key => {
        let rolls: number[] = [];
        for (let i=0; i<4; i++) {
          rolls.push(Math.floor(Math.random() * 6)+1);
        }
        rolls.sort(
          (a: number, b: number) => {
            return b - a
          }
        );
        this.abilityScores[key] = rolls[0] + rolls[1] + rolls[2];
      }
    )
  }

  previousComponent() {
    this._router.navigate(["create/background"]);
  }

  chooseAbilities() {
    this.resetErrors();
    let error = false;
    this.keys.forEach(
      key => {
        this.errors[key] = (this.abilityScores[key] + this.abilityBonuses[key] > 20)
        if (!error) {
          console.log("Error is being set to true");
          error = this.errors[key];
        }
      }
    );
    if (!error) {
      this._character.abilitiesObs$.next(
        {
          baseStats: {
            scores: {
              strength: this.abilityScores.strength,
              dexterity: this.abilityScores.dexterity,
              constitution: this.abilityScores.constitution,
              wisdom: this.abilityScores.wisdom,
              intelligence: this.abilityScores.intelligence,
              charisma: this.abilityScores.charisma
            },
            bonuses: {
              strength: this.abilityBonuses.strength,
              dexterity: this.abilityBonuses.dexterity,
              constitution: this.abilityBonuses.constitution,
              wisdom: this.abilityBonuses.wisdom,
              intelligence: this.abilityBonuses.intelligence,
              charisma: this.abilityBonuses.charisma
            }
          },
          stats: {
            strength: this.abilityScores.strength + this.abilityBonuses.strength,
            dexterity: this.abilityScores.dexterity + this.abilityBonuses.dexterity,
            constitution: this.abilityScores.constitution + this.abilityBonuses.constitution,
            wisdom: this.abilityScores.wisdom + this.abilityBonuses.wisdom,
            intelligence: this.abilityScores.intelligence + this.abilityBonuses.intelligence,
            charisma: this.abilityScores.charisma + this.abilityBonuses.charisma
          }
        }
      );
      if (this._character.createCharacter()) {
        this._router.navigate(["sheet"]);
      }
      return true;
    } else {
      return false;
    }
  }
}
