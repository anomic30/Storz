import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MeshBasicMaterial } from 'three'
import { default as ReactGlobe } from 'react-globe.gl'
import countries from '../../assets/datasets/ne_110m_admin_0_countries.json'

function Globe({width, height, backgroundColor, dotColor}) {
    // data
    const countriesData = useMemo(() => countries.features, [])
    const labelsData = useMemo(() => countriesData.filter(d => d.properties.POP_RANK >= 15), [countriesData])

    // config
    const showLabelText = false
    const labelSize = showLabelText ? 1.5 : 0
    const labelResolution = showLabelText ? 3 : 1
    const maxNumArcs = 8
    const arcRelativeLength = 0.5 // relative to whole arc
    const arcFlightTime = 3000 // ms
    const arcSpawnInterval = arcFlightTime / maxNumArcs
    const numRings = 2
    const ringMaxRadius = 3 // deg
    const ringPropagationSpeed = 2 // deg/sec
    const ringRepeatPeriod = (arcFlightTime * arcRelativeLength) / numRings
    const autoRotate = true
    const enableZoom = false

    // transparent globe
    const globeMaterial = useMemo(() => new MeshBasicMaterial({
        color: backgroundColor,
        opacity: 0.6,
        transparent: true
    }), [backgroundColor])

    // improve performance
    const rendererConfig = useMemo(() => ({
        antialias: false,
        alpha: false,
        precision: 'lowp',
        powerPreference: 'low-power'
    }), [])

    // logic
    const globeRef = useRef()
    const [arcsData, setArcsData] = useState([])
    const [ringsData, setRingsData] = useState([])

    const cleanup = useCallback(() => {
        globeRef.current.renderer().dispose()
    }, [])

    const spawnArc = useCallback(() => {
        if (arcsData.length >= maxNumArcs) {
            return
        }

        cleanup()

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
        }, arcFlightTime * 2)

        // add and remove destination rings
        setTimeout(() => {
            const destRing = { lat: destLat, lng: destLng }
            setRingsData(curRingsData => [...curRingsData, destRing])
            setTimeout(() => {
                setRingsData(curRingsData => curRingsData.filter(r => r !== destRing))
            }, arcFlightTime * arcRelativeLength)
        }, arcFlightTime)
    }, [labelsData, arcsData.length, cleanup])

    // spawn arcs regularly
    useEffect(() => {
        const id = setInterval(() => {
            spawnArc()
        }, arcSpawnInterval)
        return () => {
            clearInterval(id)
        }
    }, [arcSpawnInterval, spawnArc])

    useEffect(() => {
        const initialCoordinates = {
            lat: 16.8001,
            lng: 48.9264,
            altitude: 1.85
        }

        globeRef.current.pointOfView(initialCoordinates)
        globeRef.current.controls().autoRotateSpeed = 1
        globeRef.current.controls().autoRotate = autoRotate
        globeRef.current.controls().enableZoom = enableZoom

        const currentPolarAngle = globeRef.current.controls().getPolarAngle()
        globeRef.current.controls().minPolarAngle = currentPolarAngle - 0.7
        globeRef.current.controls().maxPolarAngle = currentPolarAngle + 0.1
    }, [autoRotate, enableZoom])

    return (
        <ReactGlobe
            ref={globeRef}
            width={width}
            height={height}
            backgroundColor={`${backgroundColor}00`}
            globeMaterial={globeMaterial}
            atmosphereAltitude={0.1}
            hexPolygonsData={countriesData}
            hexPolygonAltitude={0.02}
            hexPolygonResolution={2}
            hexPolygonMargin={0.85}
            hexPolygonColor={useCallback(() => dotColor, [dotColor])}
            hexPolygonCurvatureResolution={0}
            labelsData={labelsData}
            labelLat={useCallback(d => d.properties.LABEL_Y, [])}
            labelLng={useCallback(d => d.properties.LABEL_X, [])}
            labelText={useCallback(d => d.properties.NAME, [])}
            labelSize={labelSize}
            labelDotRadius={0.8}
            labelColor={useCallback(() => '#ffffff', [])}
            labelAltitude={0.03}
            labelResolution={labelResolution}
            arcsData={arcsData}
            arcDashLength={arcRelativeLength}
            arcDashGap={2}
            arcDashInitialGap={1}
            arcDashAnimateTime={arcFlightTime}
            arcColor={useCallback(() => '#ffffff', [])}
            arcAltitudeAutoScale={0.3}
            arcsTransitionDuration={0}
            ringsData={ringsData}
            ringMaxRadius={ringMaxRadius}
            ringPropagationSpeed={ringPropagationSpeed}
            ringRepeatPeriod={ringRepeatPeriod}
            ringColor={useCallback(() => t => `rgba(255,255,255,${1-t})`, [])}
            ringAltitude={0.03}
            waitForGlobeReady={false}
            animateIn={false}
            rendererConfig={rendererConfig}
        />
    )
}

export default Globe
