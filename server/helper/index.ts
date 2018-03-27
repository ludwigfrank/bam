if (!String.prototype.bracketsIntoArray) {
    String.prototype.bracketsIntoArray = function(this: string): string[] {
        return this
            .split(/\[[0-9]+]/g)
            .filter((val) => val)
    }
}


interface summarizedLocation {
    city?: string,
    state?: string,
    country?: string
}

export const summarizeLocationAsString = (loc: summarizedLocation) => {
    return `${loc.city || '–'}, ${loc.state || '–'}, ${loc.country || 'USA'}`
}
