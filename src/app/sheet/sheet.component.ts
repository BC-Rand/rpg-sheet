import { Component, OnInit } from '@angular/core';
import { APIService } from "../api.service";

import { AbilityScores, Character, Class, SkillProficiencies, Trait } from '../types/character';
import { ClassField } from '@angular/compiler';
import { CharacterService } from '../character.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: ['./sheet.component.css']
})
export class SheetComponent implements OnInit {
  
  public character: Character;
  public proficiencyBonus: number;

  public abilityKeys: Array<keyof AbilityScores> = ["strength", "dexterity", "constitution", "wisdom", "intelligence", "charisma"]

  public rollData: {label: string, roll: number, mod: number}[] = [];

  public levelUpData: {
    abilityBonus: {
      true: boolean
      values: AbilityScores
    }
    rollForHp: boolean
    features: Trait[]
  } = {
    abilityBonus: {
      true: false,
      values: {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        wisdom: 0,
        intelligence: 0,
        charisma: 0
      }
    },
    rollForHp: false,
    features: []
  }

  constructor(
    private _api: APIService,
    private _character: CharacterService
    ) { }  

  ngOnInit(): void {
    this.proficiencyBonus = 2;
    this._character.characterObs$.pipe(
      filter(data => !!data)
    ).subscribe(character => {
      this.character = character;
      console.log(this.character);
      this.calculateProficiencyBonus(this.character.level);
      this.calculateArmorClass();
      this.prepareLevelUp();
    });
  }

  calculateProficiencyBonus(level: number) {
    this.proficiencyBonus = Math.min((level-1)/4)+2
  }

  savingThrow(key: keyof AbilityScores, proficient: boolean = false) {
    let numberString: string = this.stringifyMod(this.character.stats[key], proficient);
    return numberString;
  }

  calculateArmorClass() {
    let dexMod = this.calculateMod(this.character.stats.dexterity);
    if (dexMod > 2) {
      dexMod = 2;
    } else if (dexMod < 0) {
      dexMod = 0
    }
    this.character.armorClass = 10 + dexMod;
  }

  stringifyMod(abilityScore: number, proficient: boolean = false) {
    let mod: number = this.calculateMod(abilityScore, proficient);
    return ((mod >= 0) ? "+" : "") + mod.toString();
  }

  calculateMod(abilityScore: number, proficient: boolean = false) {
    let number = Math.floor((abilityScore-10)/2)
    if (proficient) {
      number += this.proficiencyBonus;
    }
    return number;
  }

  rollbox(label: string, mod: number) {
    while (this.rollData.length > 17) {
      this.rollData.splice(0,1);
    }
    this.rollData.push({
      label: label,
      roll: this.roll(),
      mod: mod
    });
  }

  roll(diceValue: number = 20): number {
    return Math.floor(Math.random() * diceValue)+1
  }

  calculateHp(setCurrentHpToFull: boolean = false) {
    this.character.hitPoints.total = this.character.hitPointsBase.constitutionModTotal + this.character.hitPointsBase.perLevelTotal;
    if (setCurrentHpToFull) {
      this.character.hitPoints.current = this.character.hitPoints.total;
    }
  }

  calculateAbilityScores() {
    this.abilityKeys.forEach(key => {
      this.character.stats[key] = this.character.baseStats.scores[key] + this.character.baseStats.bonuses[key];
    })
  }

  prepareLevelUp() {
    console.log("prepareLevelUp()");
    let level = this.character.classLevels[this.character.level];

    this.levelUpData.abilityBonus.true = level.ability_score_bonuses > this.character.classLevels[this.character.level-1].ability_score_bonuses

    this.levelUpData.abilityBonus.values = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      wisdom: 0,
      intelligence: 0,
      charisma: 0
    }
    
    level.features.forEach(simpleFeature => {
      this._api.getTrait(simpleFeature.url).subscribe(feature => {
        this.levelUpData.features.push({
          name: feature.name,
          description: feature.desc[0],
          source: "Class"
        })
      })
    })
  }

  levelUp() {
    console.log("This is where we'd level up.")

    if (this.character.level < 20) {
      // Increasing Level
      this.character.level++

      // Increasing hit dice
      this.character.hitDice.total++
      this.character.hitDice.current++

      // Traits
      this.levelUpData.features.forEach(feature => {
        this.character.traits.push(feature);
      })
      this.levelUpData.features = [];
  
      // Ability Score Improvement
      if (this.levelUpData.abilityBonus.true) {
        this.abilityKeys.forEach(key => {
          this.character.baseStats.bonuses[key] += this.levelUpData.abilityBonus.values[key];
        });
      }
      this.calculateAbilityScores();
  
      // HP (Comes after Ability Score Improvements)
      if (this.levelUpData.rollForHp) {
        this.character.hitPointsBase.perLevelTotal += this.roll(this.character.class.hit_die)
      } else {
        this.character.hitPointsBase.perLevelTotal += this.character.class.hit_die / 2 + 1;
      }
      this.character.hitPointsBase.constitutionModTotal = this.calculateMod(this.character.stats.constitution) * this.character.level;
      this.calculateHp(true);

      this.prepareLevelUp();
    }
  }
}
