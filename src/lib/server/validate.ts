export function validatePoints(points: FormDataEntryValue | null, nonNegative: boolean = true): number {
    const parsedPoints = parseInt(points as string)

    if (points === null) throw Error("Points value was not provided!");
    if (Number.isNaN(parsedPoints)) throw Error("Could not parse a number");
    if (nonNegative && parsedPoints < 0) throw Error("Points value must be greater than 0!");

    return parsedPoints
}

export function validateString(value: FormDataEntryValue | null): string {
    if (value === null) throw Error("A required input was not provided")

    const parsedValue = value as string;

    if (parsedValue.length === 0) throw Error("A required input was left empty")

    return value as string
}

export function validateDate(value: FormDataEntryValue | null): Date {
    if (value === null) throw Error("A required input was not provided")

    const parsedDate = new Date(value as string)

    return parsedDate
}

export function validateFile(value: FormDataEntryValue | null): File {
    if (value === null) throw Error("A required input was not provided")

    return value as File
}

export function validateNullableString(value: FormDataEntryValue | null) {
    if (value === null || (value as string).length === 0) {
        return null
    } else {
        return value as string
    }
}