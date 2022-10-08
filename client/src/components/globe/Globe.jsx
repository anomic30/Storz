import { useCallback, useEffect, useState } from 'react'
import { MeshBasicMaterial } from 'three'
import { default as ReactGlobe } from 'react-globe.gl'
import countries from '../../assets/datasets/ne_110m_admin_0_countries.json'

function Globe() {
    // data
    const countriesData = countries.features
    const labelsData = countriesData.filter(d => d.properties.POP_RANK >= 15)

    // config
    const showLabelText = false
    const labelSize = showLabelText ? 1.5 : 0
    const labelResolution = showLabelText ? 3 : 0
    const maxNumArcs = 12
    const arcRelativeLength = 0.6 // relative to whole arc
    const arcFlightTime = 3000 // ms
    const arcSpawnInterval = arcFlightTime / maxNumArcs
    const numRings = 3
    const ringMaxRadius = 5 // deg
    const ringPropagationSpeed = 2 // deg/sec
    const ringRepeatPeriod = (arcFlightTime * arcRelativeLength) / numRings

    // transparent globe
    const globeMaterial = new MeshBasicMaterial({
        color: '#121916', // should sync with background-color in "src/pages/landing/Landing.css"
        opacity: 0.6,
        transparent: true
    })

    // improve performance
    const rendererConfig = {
        antialias: false,
        alpha: false,
        precision: 'lowp',
        powerPreference: 'low-power'
    }

    // logic
    const [arcsData, setArcsData] = useState([])
    const [ringsData, setRingsData] = useState([])
    const [arcsCount, setArcsCount] = useState(0)

    const emitArc = useCallback(() => {
        // random source and destination
        const srcIdx = Math.floor(Math.random() * labelsData.length)
        let destIdx
        do {
            destIdx = Math.floor(Math.random() * labelsData.length)
        } while (destIdx === srcIdx)

        const { LABEL_Y: srcLat, LABEL_X: srcLng } = labelsData[srcIdx].properties
        const { LABEL_Y: destLat, LABEL_X: destLng } = labelsData[destIdx].properties

        // add and remove source rings
        const srcRing = { lat: srcLat, lng: srcLng }
        setRingsData(curRingsData => [...curRingsData, srcRing])
        setTimeout(() => {
            setRingsData(curRingsData => curRingsData.filter(r => r !== srcRing))
        }, arcFlightTime * arcRelativeLength)

        // add and remove arc after 1 cycle
        const arc = { startLat: srcLat, startLng: srcLng, endLat: destLat, endLng: destLng }
        setArcsData(curArcsData => [...curArcsData, arc])
        setTimeout(() => {
            setArcsData(curArcsData => curArcsData.filter(d => d !== arc))
            setArcsCount(arcsCount - 1)
        }, arcFlightTime * 2)

        // add and remove destination rings
        setTimeout(() => {
            const destRing = { lat: destLat, lng: destLng }
            setRingsData(curRingsData => [...curRingsData, destRing])
            setTimeout(() => {
                setRingsData(curRingsData => curRingsData.filter(r => r !== destRing))
            }, arcFlightTime * arcRelativeLength)
        }, arcFlightTime)

        setArcsCount(arcsCount + 1)
    })

    // spawn arcs regularly
    useEffect(() => {
        if (arcsCount < maxNumArcs) {
            const id = setTimeout(() => {
                emitArc()
            }, arcSpawnInterval)
            return () => {
                clearTimeout(id)
            }
        }
    }, [arcsCount])

    return (
        <ReactGlobe
            width={525}
            height={525}
            backgroundColor={'rgba(0,0,0,0)'}
            globeMaterial={globeMaterial}
            atmosphereAltitude={0.1}
            hexPolygonsData={countriesData}
            hexPolygonAltitude={0.02}
            hexPolygonResolution={2}
            hexPolygonMargin={0.85}
            hexPolygonColor={useCallback(() => '#00ffa8')}
            hexPolygonCurvatureResolution={0}
            labelsData={labelsData}
            labelLat={useCallback(d => d.properties.LABEL_Y)}
            labelLng={useCallback(d => d.properties.LABEL_X)}
            labelText={useCallback(d => d.properties.NAME)}
            labelSize={labelSize}
            labelDotRadius={0.8}
            labelColor={useCallback(() => '#ffffff')}
            labelAltitude={0.03}
            labelResolution={labelResolution}
            arcsData={arcsData}
            arcDashLength={arcRelativeLength}
            arcDashGap={2}
            arcDashInitialGap={1}
            arcDashAnimateTime={arcFlightTime}
            arcColor={useCallback(() => '#ffffff')}
            arcAltitudeAutoScale={0.3}
            arcsTransitionDuration={0}
            ringsData={ringsData}
            ringMaxRadius={ringMaxRadius}
            ringPropagationSpeed={ringPropagationSpeed}
            ringRepeatPeriod={ringRepeatPeriod}
            ringColor={useCallback(() => t => `rgba(255,255,255,${1-t})`)}
            ringAltitude={0.03}
            waitForGlobeReady={false}
            animateIn={false}
            rendererConfig={rendererConfig}
        />
    )
}

export default Globe
