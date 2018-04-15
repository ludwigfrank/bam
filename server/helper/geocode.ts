import * as Geocoder from 'node-geocoder'
import * as fs from 'fs'
import * as bfj from 'bfj'
const doctors = require('../data/generated/doctors/doctors-min.json')

// google location api
// const geocoderOptions = {
//     provider: 'google',
//     httpAdapter: 'https',
//     apiKey: 'AIzaSyD6owl91GMU8Rv7H4W2kdaM4KXV-yF9PJc',
//     formatter: null,
// }

// here location api
const geocoderOptions = {
    provider: 'here',
    httpAdapter: 'https',
    appId: 'f0T4kx8reJzVa2sYQ2JQ',
    appCode: 'SH26N5KdRCMHp54likuN1Q',
    formatter: null,
}

// Initialize geoCoder
const geoCoder = Geocoder(geocoderOptions)

async function generateLocationCoordinate(location: string[]): Promise<Array<object>> {
    const [city, state, country] = location.replace(/ /g, '').split(',')

    const generatedLocation = await geoCoder.geocode({
        address: `${city} ${state}`,
        country: country,
        limit: 1
    }).then(res => {
        return res
    })

    return generatedLocation
}

const doctorsSlice = doctors.slice(0, 11)
// const doctorsSlice = doctors.slice(0, 50)
const doctorsWithGeo = doctorsSlice.map(async doctor => {
    let location;
    if (doctor.m && doctor.m.location) {
        location = doctor.m.location
    } else {
        location = ['–, –, –']
    }
    
    const generatedLocations = await location.map(async loc => {
        const generatedLoc = await generateLocationCoordinate(loc)
        return generatedLoc
    });

    const doctorWithGeo = await Promise.all(generatedLocations).then(res => {
        doctor.m.generatedLocation = res
        return doctor
    }).catch(err => {
        return doctor
    })
    return doctorWithGeo
})

Promise.all(doctorsWithGeo).then(res => {
    const filePath = '/Users/florianzia/Documents/Projects/bam/server/data/generated/doctors/doctorsWithGeo.json'

    const stream = bfj.streamify(res);
    stream.on('data', chunk => {
        fs.appendFileSync(filePath, chunk);
    })

    // fs.writeFile(filePath, JSON.stringify(res), err => {
    //     if (err) {
    //         console.log('Error:- ' + err);
    //         throw err;
    //     }
    //     console.log('done');
    // })
})
