import { useCallback } from 'react'
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
            labelLat={d => d.properties.LABEL_Y}
            labelLng={d => d.properties.LABEL_X}
            labelText={d => d.properties.NAME}
            labelSize={labelSize}
            labelDotRadius={0.8}
            labelColor={useCallback(() => '#ffffff')}
            labelAltitude={0.03}
            labelResolution={labelResolution}
            waitForGlobeReady={false}
            animateIn={false}
            rendererConfig={rendererConfig}
        />
    )
}

export default Globe
