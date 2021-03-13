import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChooseFrom, ClassLevelResult, ClassResult, CollectionApiResult, CustomEquipmentChooseFrom, EquipmentCategory, RaceResult, SimpleChoiceResult, TraitResult } from './types/results';

@Injectable({
  providedIn: 'root'
})
export class APIService {

  constructor(private http : HttpClient) { }

  getClasses(): Observable<CollectionApiResult> {
    return this.http.get<CollectionApiResult>("https://www.dnd5eapi.co/api/classes");
  }

  getClass(classUrl : string): Observable<ClassResult> {
    return this.http.get<ClassResult>("https://www.dnd5eapi.co" + classUrl)
    .pipe(
      map(result => {
        result.custom_equipment_options = [];
        result.proficiency_choices.forEach(proficiencyChoices => {
          proficiencyChoices.from.forEach((proficiency) => {
            proficiency.choose = false;
          });
        });
        result.starting_equipment_options.forEach(chooseFrom => {
          let customChooseFrom: CustomEquipmentChooseFrom = {
            choose: chooseFrom.choose,
            from: [],
            label: ""
          }
          chooseFrom.from.forEach(equipmentOption => {
            if (equipmentOption.hasOwnProperty("equipment_option") || equipmentOption.hasOwnProperty("equipment_category")) {
              let url = (equipmentOption.hasOwnProperty("equipment_option")) ? equipmentOption.equipment_option.from.equipment_category.url : equipmentOption.equipment_category.url
              this.getEquipmentCategory(url).subscribe(equipmentCategory => {
                equipmentCategory.equipment.forEach((equipment: SimpleChoiceResult)  => {
                  equipment.choose = false;
                })
                
                customChooseFrom.from = customChooseFrom.from.concat(equipmentCategory.equipment as SimpleChoiceResult[])
                customChooseFrom.label = equipmentCategory.name
                
                for (let index = 1; index < customChooseFrom.from.length; index++) { 
                  if (customChooseFrom.from[index].name == customChooseFrom.from[0].name) {
                    customChooseFrom.from.splice(0,1);
                    break;
                  }
                }
              })
            } else {
              if (equipmentOption.hasOwnProperty('0')) {
                customChooseFrom.from.push({
                  index: equipmentOption['0'].equipment.index,
                  name: equipmentOption['0'].equipment.name,
                  url: equipmentOption['0'].equipment.url,
                  choose: false
                })
              } else {
                customChooseFrom.from.push({
                  index: equipmentOption.equipment.index,
                  name: equipmentOption.equipment.name,
                  url: equipmentOption.equipment.url,
                  choose: false
                })
              }
            }
          })
          result.custom_equipment_options.push(customChooseFrom);
        })
        return result
      })
    );
  }
  
  getClassLevels(classLevelUrl: string): Observable<ClassLevelResult[]> {
    return this.http.get<ClassLevelResult[]>("https://www.dnd5eapi.co" + classLevelUrl);
  }
  getInventory(inventoryUrl : string) {
    return this.http.get<any>("https://www.dnd5eapi.co" + inventoryUrl);
  }

  getRace(raceName: string): Observable<RaceResult> {
    console.log("https://www.dnd5eapi.co" + raceName)
    return this.http.get<RaceResult>("https://www.dnd5eapi.co" + raceName)
    .pipe(
      map(result => {
        if (result.hasOwnProperty("ability_bonus_options") && result.ability_bonus_options !== undefined) {
          result.ability_bonus_options.from.forEach(option => {
            option.choose = false;
          });
        }
        if (result.hasOwnProperty("trait_options") && result.trait_options !== undefined) {
          result.trait_options.from.forEach((option: SimpleChoiceResult) => {
            option.choose = false;
          });
        }
        if (result.hasOwnProperty("language_options") && result.language_options !== undefined) {
          result.language_options.from.forEach((option: SimpleChoiceResult) => {
            option.choose = false;
          });
        }
        if (result.hasOwnProperty("starting_proficiency_options") && result.starting_proficiency_options !== undefined) {
          console.log(result.starting_proficiency_options);
          result.starting_proficiency_options.from.forEach(
            (option: SimpleChoiceResult) => {
              option.choose = false;
            }
          )
        }
        return result
      })
    );
  }
  
  getRaces(): Observable<CollectionApiResult> {
    return this.http.get<CollectionApiResult>("https://www.dnd5eapi.co/api/races");
  }

  getTrait(url: string): Observable<TraitResult> {
    return this.http.get<TraitResult>("https://www.dnd5eapi.co" + url);
  }

  getEquipmentCategory(url: string): Observable<EquipmentCategory> {
    return this.http.get<EquipmentCategory>("https://www.dnd5eapi.co" + url)
  }

  getItem(url: string) {
    return this.http.get("https://www.dnd5eapi.co" + url)
  }
}
