/// <reference path="index.d.ts" />
import { createServer } from 'http'
import { parse } from 'url'
import * as next from 'next'
import * as csv from 'csvtojson'
import * as fs from 'fs'
import { nameParser, dateParser, cityParser } from "./parser"
import './helper'
import { summarizeLocationAsString } from "./helper"
// import './helper/geocode'

const generatedFilePath = './server/data/generated'
const csvFilePath = './server/data/doctors_by_key.csv'

let data = []
let index = 0

// The cities contained in the database, used for geocoding
let locations = []
const locationsOccurence = {}

// Split the parsed file in multiple Json files to not exceed editor file size limit
const MAX_NODES_PER_FILE = 1000
// Generate new doctor json file from csv and write to files
const WRITE_FILES_TO_JSON = false
// Write the cities in a separate file
const EXTRACT_AND_WRITE_CITIES = false

if (WRITE_FILES_TO_JSON) {
    csv({
        workerNum: 1,
        ignoreEmpty: true,
        delimiter: ";",
        includeColumn: ['m', 'key'],
        toArrayString: true,
        colParser: {
            'list.name': item => nameParser(item),
            'm.city': cities => cityParser(cities),
            'm.date': dates => dateParser(dates),
            'm.inst': institutes => institutes.bracketsIntoArray(),
            'm.st': states => states.bracketsIntoArray(),
            'm.prog': states => states.bracketsIntoArray(),
            'm.country': countries => countries.bracketsIntoArray()
        },
    })
        .fromFile(csvFilePath)
        .on('json',(jsonObj) => {

            if (EXTRACT_AND_WRITE_CITIES) {
                if (jsonObj.m && Array.isArray(jsonObj.m.date)) {
                    jsonObj.m.location = []
                    jsonObj.m.date.map((date, index) => {
                        const location = summarizeLocationAsString({
                            city: jsonObj.m.city ? jsonObj.m.city[index] : '–',
                            state: jsonObj.m.st ? jsonObj.m.st[index] : '–',
                            // Set USA to default country if none is provided
                            country: jsonObj.m.country ? jsonObj.m.country[index] : 'USA'
                        })

                        jsonObj.m.location.push(location)

                        if(locations.indexOf(location) === -1) {
                            locations.push(location)
                        } else {
                            locationsOccurence[location] =
                                locationsOccurence[location]
                                    ? locationsOccurence[location] += 1
                                    : 1
                        }
                    })
                }
            }

            data.push(jsonObj)
            if (data.length >= MAX_NODES_PER_FILE) {
                fs.writeFileSync(
                    `${generatedFilePath}/doctors/doctors-${index}.json`,
                    JSON.stringify(data, null, 4)
                )

                index ++
                data = []
            }
        })
        .on('error', err => {console.log(err)})
        .on('done', (err) => {
            if (EXTRACT_AND_WRITE_CITIES) {
                const alphabeticallySortedLocations = locations.sort((a,b) =>
                    a.toLowerCase().localeCompare(b.toLowerCase())
                )

                fs.writeFileSync(
                    `${generatedFilePath}/locations/locations.json`,
                    JSON.stringify(alphabeticallySortedLocations, null, 4)
                )

                fs.writeFileSync(
                    `${generatedFilePath}/locations/locationsOccurence.json`,
                    JSON.stringify(locationsOccurence, null, 4)
                )
            }
            console.log('end')

        })
}

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
    .then(() => {
        createServer((req, res) => {
            const parsedUrl = parse(req.url, true)
            const { pathname, query } = parsedUrl

            if (pathname === '/a') {
                app.render(req, res, '/a', query)
            } else if (pathname === '/b') {
                app.render(req, res, '/b', query)
            } else {
                handle(req, res, parsedUrl)
            }
        })
            .listen(port, (err) => {
                if (err) throw err
                console.log(`> Ready on http://localhost:${port}`)
            })
    })
