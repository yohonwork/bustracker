const pupeteer = require('puppeteer');
const { RealTime, Vehicle } = require('./realTime')
const { Kafka } = require('kafkajs');

// 카프카 클라이언트 설정
const kafka = new Kafka({
	clientId: 'bus8002producer',
	brokers: ['192.168.11.10:9092', '192.168.11.11:9092', '192.168.11.12:9092']
})

const producer = kafka.producer();

const get_8002_bus_data = async (putMessageQue) => {

	await producer.connect()

	const browser = await pupeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
	const page    = await browser.newPage()

	// go to page
	await page.goto('https://www.gbis.go.kr/gbis2014/schBus.action?mapTabCd=3', { waitUntil: 'networkidle0' })

	// get content
	const content = await page.content();

	// search 8002 bus
	await page.type('#lineNumber', '8002')
	await page.click('#realTimeBus > div.search_input.skip_to > fieldset > div > button')
	await page.waitForNetworkIdle()

	// 8002 bus get search data after
	await page.click('#route222000084 > a')
	await page.waitForNetworkIdle()

	// data get cycle 120s -> 15s
	await page.select('#contents > div.mapct_right > div.rtb_wrap.cross > p > select', '15')
	await page.waitForNetworkIdle()
	
	// get bus data
	page.on('response', async (response)=> {
		const request = response.request();
		if (request.resourceType() === 'xhr') {
			const raw = await response.json();
			putMessageQue(raw.result)
		}
	})	
}

async function putMessageQue(raw) {

//	console.log(raw)
//	console.log()
//	console.log(raw.realTime.busno)
//	console.log(raw.realTime.list)
//	console.log(raw.realTime.dirList)
	// vehicleList
	// busno
	// [[ '경기74아3267' ],  [ '경기74아3337' ],  [ '경기74아3348' ],  [ '경기74아3360' ],  [ '경기74아3444' ]]
	// list
	// [{ busXList: [ 14171587 ], density: '0', cdmaNo: '', busPosition: [ '2' ], routeNm: '8002', busSapceList: [ [Object] ], fromStationId: '222000009', lowBusYn: [ 'N' ],
    // busDirList: [ 'U' ], busYList: [ 4531226 ], vehId: '222001022', toStationId: '222000149', reservation: 'N', busNo: [ '경기74아3427' ], lowPlate: '2', vehType: '4'},

	const vehicleCount = raw.realTime.count
	const rawBusList   = raw.realTime.list
	const dirList      = raw.realTime.dirList
	const vehicles     = rawBusList.map((v, i)=>{
		return new Vehicle(
					  v.vehId
					, v.routeNm
					, v.busNo[0]
					, v.fromStationId
					, v.toStationId
					, dirList[i][0]
					, v.busXList[0]
					, v.busYList[0]
				)
	})

	if (vehicleCount > 0) {
		producer.send({
			topic: 'bus8002',
			messages:[ { value: JSON.stringify(vehicles) }]
		})
	} 

}

async function main() {
	get_8002_bus_data(putMessageQue);
}

main()
