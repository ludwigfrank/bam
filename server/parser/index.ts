// Todo: use this array to strip illegal characters off the string
// const illegalCharacters = ['|']

export const nameParser = (names: string): string => {
    return names
        .replace(/\s\s+/g, ' ')
        .split(' ')
        .map(name => name.length === 1 ? name + '.' : name)
        .toString()
        .replace(/,/g, ' ')
}

export const dateParser = (dates: string): Array<Array<number>> => {
    return dates
        .split(/\[[0-9]+]/g)
        .reduce((acc, cur) => {
            if (cur !== undefined && cur !== "") {
                const dateRange: Array<number> = cur
                    .split(' ')
                    .map(date => parseInt(date.length === 2 ? '19' + date : date))
                return [...acc, dateRange]
            } else {
                return []
            }
        }, [])
}

export const cityParser = (cities: string): Array<string> => {
    return cities
        .replace(/[|&;$%@"<>()+,]/g, "")
        .split(/\[[0-9]+]/g)
        .reduce((acc, cur) => {
            if (cur !== undefined && cur !== "") {
                return [...acc, cur.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())]
            } else {
                return []
            }
        }, [])
}