import * as Geocoder from 'node-geocoder'
import * as fs from 'fs'
import * as pureLocations from '../data/generated/locations/locations.json'
import { HERE_APP_CODE, HERE_APP_ID } from "../constants"

const pLoc = pureLocations.slice(0, 100)

const geocoderOptions = {
    provider: 'here',
    httpAdapter: 'http',
    appId: HERE_APP_ID,
    appCode: HERE_APP_CODE,
    formatter: null,
}

// Initialize geoCoder
const geoCoder = Geocoder(geocoderOptions)

async function generateLocationCoordinates (locations: string[]): Promise<Array<object>> {
    // Initialize array of locations with geo coordinates
    const newLocations = []

    for (const location of locations) {
        await geoCoder.geocode({
            address: location,
            limit: 1
        }).then(res => {
            const loc = res[0]
            newLocations.push({
                address: location,
                coordinates: [loc.latitude, loc.longitude],
                country: loc.country,
                countryCode: loc.countryCode,
                city: loc.city,
                district: loc.district,
                formattedAddress: loc.formattedAddress
            })
        }).catch(err => {
            console.log(err)
        })
    }

    return newLocations
}

generateLocationCoordinates(pLoc).then(
    data => {
        fs.writeFileSync(
            `./server/data/locations/saturatedLocations.json`,
            JSON.stringify(data, null, 2)
        )
    }
)
