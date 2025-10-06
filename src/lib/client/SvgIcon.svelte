<script lang="ts">
    const {
        type = 'mdi',
        path = '',
        size,
        width,
        height,
        viewbox,
        flip,
        rotate = 0,
    }: {
        path?: string;
        type?: 'mdi' | 'simple-icons';
        size?: string | number;
        width?: string | number;
        height?: string | number;
        viewbox?: string;
        flip?: 'horizontal' | 'vertical' | 'both';
        rotate?: string | number;
    } = $props();

    const types = {
        mdi: { size: '24px', viewbox: '0 0 24 24' },
        'simple-icons': { size: '24px', viewbox: '0 0 24 24' },
        default: { size: '1em', viewbox: '0 0 100 100' },
    };

    const defaults = $derived(types[type]);

    const svgWidth = $derived(width ?? size ?? defaults.size);
    const svgHeight = $derived(height ?? size ?? defaults.size);
    const svgViewbox = $derived(viewbox ?? defaults.viewbox);

    const scaleX = $derived(flip === 'horizontal' || flip === 'both' ? -1 : 1);
    const scaleY = $derived(flip === 'vertical' || flip === 'both' ? -1 : 1);

    const rotation = $derived(
        typeof rotate === 'number' ? `${rotate}deg` : rotate,
    );
</script>

<svg
    width={isNaN(Number(svgWidth)) ? svgWidth : `${svgWidth}px`}
    height={isNaN(Number(svgHeight)) ? svgHeight : `${svgHeight}px`}
    viewBox={svgViewbox}
    style="transform: rotate({rotation}) scale({scaleX}, {scaleY});"
>
    <path d={path} fill="currentColor" />
</svg>

<style>
    svg {
        display: inline-grid;
        place-items: center;
    }
</style>
