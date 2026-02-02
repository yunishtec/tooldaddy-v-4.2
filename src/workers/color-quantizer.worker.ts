
// This is a simplified version of a color quantization library like RgbQuant.js
// It's designed to run in a Web Worker to offload heavy computation.

class VBox {
    private pixels: number[][];
    private rmin: number; rmax: number;
    private gmin: number; gmax: number;
    private bmin: number; bmax: number;

    constructor(pixels: number[][], public i0: number, public i1: number) {
        this.pixels = pixels;
        this.rmin = 0; this.rmax = 0;
        this.gmin = 0; this.gmax = 0;
        this.bmin = 0; this.bmax = 0;
        this.init();
    }

    private init() {
        let rmin = 1000000, rmax = 0, gmin = 1000000, gmax = 0, bmin = 1000000, bmax = 0;
        let r, g, b;
        for (let i = this.i0; i <= this.i1; i++) {
            [r, g, b] = this.pixels[i];
            if (r < rmin) rmin = r; else if (r > rmax) rmax = r;
            if (g < gmin) gmin = g; else if (g > gmax) gmax = g;
            if (b < bmin) bmin = b; else if (b > bmax) bmax = b;
        }
        this.rmin = rmin; this.rmax = rmax;
        this.gmin = gmin; this.gmax = gmax;
        this.bmin = bmin; this.bmax = bmax;
    }

    public count() { return this.i1 - this.i0 + 1; }

    public avg() {
        let n = 0;
        let rsum = 0, gsum = 0, bsum = 0;
        for (let i = this.i0; i <= this.i1; i++) {
            let [r, g, b] = this.pixels[i];
            rsum += r; gsum += g; bsum += b;
            n++;
        }
        return n > 0 ? [Math.round(rsum / n), Math.round(gsum / n), Math.round(bsum / n)] : [0, 0, 0];
    }

    public split(): VBox[] {
        const rw = this.rmax - this.rmin;
        const gw = this.gmax - this.gmin;
        const bw = this.bmax - this.bmin;
        const maxw = Math.max(rw, gw, bw);
        if (this.count() === 0) return [this, this];
        
        let key: 0|1|2;
        if (maxw === rw) {
            this.pixels.sort((a,b) => a[0]-b[0]);
            key = 0;
        } else if (maxw === gw) {
            this.pixels.sort((a,b) => a[1]-b[1]);
            key = 1;
        } else {
            this.pixels.sort((a,b) => a[2]-b[2]);
            key = 2;
        }

        let med = Math.floor(this.count() / 2);
        let j = this.i0 + med;
        
        let vbox1 = new VBox(this.pixels, this.i0, j - 1);
        let vbox2 = new VBox(this.pixels, j, this.i1);
        return [vbox1, vbox2];
    }
}

const quantize = (pixels: number[][], maxColors: number) => {
    const vbox = new VBox(pixels, 0, pixels.length - 1);
    const pq = [vbox];

    function iter(lh: VBox[], target: number): VBox[] {
        let niters = 0;
        let vbox;
        while (niters < 1000) {
            vbox = lh.shift();
            if (!vbox || vbox.count() === 0) {
                lh.push(vbox!);
                niters++;
                continue;
            }
            const vboxes = vbox.split();
            lh.push(vboxes[0]);
            if (vboxes[1]) lh.push(vboxes[1]);
            if (lh.length >= target) return lh;
            if (niters++ > 1000) return lh;
        }
        return lh;
    }

    const pq2 = iter(pq, maxColors);
    
    return {
      palette: () => pq2.map(vbox => vbox.avg())
    };
}


self.onmessage = (event: MessageEvent<{ imageData: ImageData, colorCount: number }>) => {
    try {
        const { imageData, colorCount } = event.data;
        const pixels: number[][] = [];
        for (let i = 0; i < imageData.data.length; i += 4) {
            // Skip transparent or near-transparent pixels
            if (imageData.data[i + 3] < 128) continue;
            pixels.push([imageData.data[i], imageData.data[i+1], imageData.data[i+2]]);
        }
        
        const colorMap = quantize(pixels, colorCount);
        const newPalette = colorMap.palette().map((rgb: number[]) => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);

        self.postMessage({ type: 'palette', palette: newPalette });
    } catch (e) {
        self.postMessage({ type: 'error', message: (e as Error).message });
    }
};
