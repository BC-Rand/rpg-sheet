import { SimpleChoiceResult, ChooseFrom, SimpleApiResult, ClassResult, AbilityBonusResult, RaceResult, ClassLevelResult } from "./results";

export interface Character {
    name: string
    class: ClassResult
    classLevels: ClassLevelResult[];
    race: RaceResult
    background: Background
    level: number
    hitPoints: AttributeValue
    hitPointsBase: {
        constitutionModTotal: number
        perLevelTotal: number
    }
    hitDice: AttributeValue
    baseStats: {
        scores: AbilityScores
        bonuses: AbilityScores
    }
    stats: AbilityScores
    savingThrows: SavingThrows
    proficiencies: SimpleApiResult[]
    skill_proficiencies: SkillProficiencies
    inventory: any
    armorClass: any
    traits: any
    spells: any
    languages: any
}

export interface SkillProficiencies {
    acrobatics: SkillProficiency
    animal_handling: SkillProficiency
    arcana: SkillProficiency
    athletics: SkillProficiency
    deception: SkillProficiency
    history: SkillProficiency
    insight: SkillProficiency
    intimidation: SkillProficiency
    investigation: SkillProficiency
    medicine: SkillProficiency
    nature: SkillProficiency
    perception: SkillProficiency
    performance: SkillProficiency
    persuasion: SkillProficiency
    religion: SkillProficiency
    sleight_of_hand: SkillProficiency
    stealth: SkillProficiency
    survival: SkillProficiency
}

export interface SkillProficiency {
    disabled?: boolean
    stat?: keyof AbilityScores
    proficient: boolean
    name: string
    source: string
}

export interface AbilityScores {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
}

export interface AbilityBundle {
    stats: AbilityScores
    baseStats: {
        scores: AbilityScores
        bonuses: AbilityScores
    }
}

export interface SavingThrows {
    strength: boolean
    dexterity: boolean
    constitution: boolean
    intelligence: boolean
    wisdom: boolean
    charisma: boolean
}

export interface Class {
    class_levels: string
    hit_die: number
    index: string
    name: string
    proficiencies: SimpleApiResult[]
    proficiency_choices: ChooseFrom[]
    saving_throws: SimpleApiResult[]
    spellcasting?: string
    spells?: string
    starting_equipment: string
    subclasses: SimpleApiResult[]
    url: string
}

export interface ClassBundle {
    class: ClassResult
    skillProficiencies: SkillProficiency[]
    classProficiencies: SimpleChoiceResult[]
    classLevels: ClassLevelResult[]
    inventory: Equipment[]
}

export interface RaceBundle {
    abilityBonusChoices: AbilityBonusResult[]
    startingProficiencyChoices: SimpleChoiceResult[]
    skillProficiencyChoices: SkillProficiency[]
    languageChoices: SimpleChoiceResult[]
    race: RaceResult
}

export interface Background {
    name: string
    trait: Trait
    proficiencies: SkillProficiency[]
    equipment: Equipment[]
}

export interface BackgroundBundle {
    name: string
    background: Background
}

export interface Trait {
    index?: string,
    name: string,
    description: string,
    source: string
}

export interface Equipment {
    index: string
    name: string
    description: string
    quantity: number
    url: string
}

export interface AttributeValue {
    total: number
    current: number
}

export enum AbilityNames {
    'str' = 'strength',
    'dex' = 'dexterity',
    'con' = 'constitution',
    'wis' = 'wisdom',
    'int' = 'intelligence',
    'cha' = 'charisma'
}