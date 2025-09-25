export type Redeemable = {
    id: string
    name: string,
    description: string,
    redeemMessage: string
    cost: number,
}

export const redeemableItems: Redeemable[] = [
    {
        id: "andrew_homecooked_dinner",
        name: "Homecooked Dinner with Andrew",
        description: "Come over to Andrew's apartment and he will cook you a romantic dinner.",
        redeemMessage: "Andrew will be reaching out to you to schedule a date shortly.",
        cost: 300,
    },
    {
        id: "miles_mystery_gift",
        name: "Mystery Gift",
        description: "Miles will procure you a mystery gift",
        redeemMessage: "Miles will be contacting you shortly",
        cost: 100,
    },
    {
        id: "night_with_deriso",
        name: "Night with Deriso",
        description: "Switch rooms with Miles for a night, sleep in room 8 with Deriso",
        redeemMessage: "Miles will be contacting you shortly.",
        cost: 150,
    },
    {
        id: "andrew_wear_clothes",
        name: "Wear Andrew's Clothes for the day",
        description: "Pick an outfit for from andrew's closet to wear for the day",
        redeemMessage: "Andrew will be reaching out to you shortly",
        cost: 200
    },
    {
        id: "andrew_best_friend",
        name: "Best Friend Photoshoot & Instagram Post",
        description: "Have a best friend themed photoshoot with andrew, and get a post announcing you are andrew's new best friend on instagram",
        redeemMessage: "Andrew will be reaching out to you shortly. Think of some ideas for pictures",
        cost: 500
    },
    {
        id: "miles_oil_massage",
        name: "Full Body Oil Massage with Miles",
        description: "Miles will oil you down, and perform a full body deep tissue massage on you",
        redeemMessage: "Miles will be reaching out to you shortly",
        cost: 500
    }
]