export interface ClassResult {
    class_levels: string
    hit_die: number
    index: string
    name: string
    proficiencies: SimpleApiResult[]
    proficiency_choices: ChooseFrom[]
    saving_throws: SimpleApiResult[]
    spellcasting?: string
    spells?: string
    starting_equipment: EquipmentResult[]
    starting_equipment_options: EquipmentChooseFromArray[]
    custom_equipment_options: CustomEquipmentChooseFrom[]
    subclasses: SimpleApiResult[]
    url: string
}

export interface RaceResult {
    ability_bonus_options?: AbilityBonusChooseFrom
    ability_bonuses: AbilityBonusResult[]
    age: string
    alignment: string
    index: string
    language_desc: string
    language_options?: ChooseFrom
    languages: SimpleApiResult[]
    name: string
    size: string
    size_description: string
    speed: number
    starting_proficiencies: SimpleApiResult[]
    starting_proficiency_options?: ChooseFrom
    subraces: SimpleApiResult[]
    trait_options?: ChooseFrom
    traits: SimpleApiResult[]
    url: string
}

export interface EquipmentResult {
    equipment: SimpleApiResult
    quantity: number
}

export interface EquipmentChooseFromArray {
    choose: number
    from: EquipmentChooseFromOption[]
}

export interface EquipmentChooseFrom {
    choose: number
    from: EquipmentChooseFromOption
}

export interface EquipmentChooseFromOption {
    equipment_option?: EquipmentChooseFrom
    equipment_category?: SimpleApiResult
    equipment?: SimpleApiResult
    quantity?: number
    '0'?: EquipmentResult
}

export interface EquipmentCategory {
    index: string
    name: string
    equipment: SimpleApiResult[]
    url: string
}

export interface CustomEquipmentChooseFrom {
    choose: number
    from: SimpleChoiceResult[]
    label: string
}

export interface AbilityBonusChooseFrom {
    choose: number
    from: AbilityBonusResult[]
    type: string
}

export interface AbilityBonusResult {
    ability_score: SimpleApiResult
    bonus: number
    choose?: boolean
}

export interface SpellcastingResult {
    info: SimpleApiResult[]
    level: number
    spellcasting_ability: SimpleApiResult
}

export interface SpellInfoResult {
    desc: string[]
    name: string
}

export interface ChooseFrom {
    choose: number
    from: SimpleChoiceResult[]
}

export interface SimpleChoiceResult {
    choose?: boolean
    index: string
    name: string
    url: string
}

export interface SimpleApiResult {
    index: string
    name: string
    url: string
}

export interface ClassLevelResult {
    ability_score_bonuses: number
    class: SimpleApiResult
    class_specific: {}
    feature_choices: SimpleApiResult[]
    features: SimpleApiResult[]
    index: string
    level: number
    prof_bonus: number
    spellcasting?: {}
    url: string
}

export interface CollectionApiResult {
    count: number,
    results: SimpleApiResult[]
}

export interface TraitResult {
    desc: string[]
    index: string
    name: string
    proficiencies: SimpleApiResult[]
    races: SimpleApiResult[]
    subraces: SimpleApiResult[]
    url: string
}