import * as Geocoder from 'node-geocoder'
import * as fs from 'fs'
import * as pureLocations from '../data/generated/locations/locations.json'

const pLoc = pureLocations.slice(0, 200)

const geocoderOptions = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: 'AIzaSyD6owl91GMU8Rv7H4W2kdaM4KXV-yF9PJc',
    formatter: null,
}

// Initialize geoCoder
const geoCoder = Geocoder(geocoderOptions)

async function generateLocationCoordinates (locations: string[]): Promise<Array<object>> {
    // Initialize array of locations with geo coordinates
    const newLocations = []
    const unidentifiedLocations = []
    for (const location of locations) {
        const [city, state, country] = location.replace(/ /g, '').split(',')
        await geoCoder.geocode({
            address: `${city} ${state}`,
            country: country,
            limit: 1
        }).then(res => {
            console.log(res)
            const loc = res[0]
            newLocations.push({
                address: location,
                coordinates: [loc.latitude, loc.longitude],
                country: loc.country,
                countryCode: loc.countryCode,
                city: loc.city,
                formattedAddress: loc.formattedAddress
            })
        }).catch(err => {
            unidentifiedLocations.push(`${city} ${state} ${country}`)
        })
    }

    return [newLocations, unidentifiedLocations]
}

generateLocationCoordinates(pLoc).then(
    data => {
        fs.writeFileSync(
            `./server/data/generated/locations/saturatedLocations.json`,
            JSON.stringify(data[0], null, 2)
        )
        fs.writeFileSync(
            `./server/data/generated/locations/unidentifiedLocations.json`,
            JSON.stringify(data[1], null, 2)
        )
    }
)
