import { useCallback } from 'react'
import { MeshBasicMaterial } from 'three'
import { default as ReactGlobe } from 'react-globe.gl'
import countries from '../../assets/datasets/ne_110m_admin_0_countries.json'

function Globe() {
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
            hexPolygonsData={countries.features}
            hexPolygonAltitude={0.02}
            hexPolygonResolution={2}
            hexPolygonMargin={0.85}
            hexPolygonColor={useCallback(() => '#00ffa8')}
            hexPolygonCurvatureResolution={0}
            waitForGlobeReady={false}
            animateIn={false}
            rendererConfig={rendererConfig}
        />
    )
}

export default Globe
