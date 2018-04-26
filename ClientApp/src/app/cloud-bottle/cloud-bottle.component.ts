import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import * as D3 from 'd3';
import { CloudDataService } from '../services/cloud-data.service';
import { CloudState } from '../word-cloud-page/word-cloud-page.component';

declare let d3: any;

export interface WeightedWord {
    text: string;
    size: number;
    occurrence: number;
}


@Component({
    selector: 'app-cloud-bottle',
    templateUrl: './cloud-bottle.component.html',
    styleUrls: ['./cloud-bottle.component.scss']
})
export class CloudBottleComponent implements OnInit, OnChanges {

    @Input() words: WeightedWord[];
    cloudWords: WeightedWord[];
    cloudWidth: number;
    cloudHeight: number;
    @Output() cloudDrawn: EventEmitter<string> = new EventEmitter<string>(true);
    constructor() { }

    ngOnInit() {
        const temp = document.querySelector('svg.bottle') as SVGElement;
        this.cloudHeight = temp.getBoundingClientRect().height;
        this.cloudWidth = temp.getBoundingClientRect().width;
    }
    ngOnChanges(changes: SimpleChanges) {
        const wordChange = changes['words'];
        let drawn: CloudState = 'unchanged';
        if (wordChange.previousValue && wordChange.previousValue.length !== wordChange.currentValue.length) {
            this.cloudWords = this.words.map((word) => ({ ...word }));
            this.dropCloud();
            this.buildLayout();
            drawn = 'new';
            if (wordChange.currentValue.length < wordChange.previousValue.length) {
                drawn = 'empty';
            }
        }

        if (wordChange.isFirstChange()) {
            drawn = 'empty';
        }
        this.cloudDrawn.emit(drawn);

    }

    buildLayout() {  // https://github.com/jasondavies/d3-cloud for cloud generator
        d3.layout.cloud()
            .size([this.cloudWidth, this.cloudHeight])
            .words(this.cloudWords)
            .padding(1)
            //   .rotate(() => ~~(Math.random() * 2) * 45) // the default rotate function may be more visually appealing
            // turns out ~~ just chops off everything to the right of the decimal
            .font('Impact')
            .fontSize((d) => d.size)
            .on('end', (input) => { // doesn't work without this arrow function
                this.createCloud(input);

            })
            .start();
    }

    dropCloud() {
        D3.select('svg.bottle').selectAll('*').remove();
        this.cloudDrawn.emit('empty');
    }
    createCloud(input) {
        const fill: D3.ScaleOrdinal<string, string> = D3.scaleOrdinal(D3.schemeCategory10);


        D3.select('svg.bottle')
            .append('g')
            .attr('transform', 'translate(' + (this.cloudWidth / 2) + ',' + (this.cloudHeight / 2) + ')')
            .selectAll('text')
            .data(this.cloudWords)
            .enter().append('text')
            .style('font-size', (d: WeightedWord) => d.size + 'px')
            .style('font-family', 'Impact')
            .style('fill', (d, i) => fill(i.toString())) // changed 'i' to 'i.toString()'
            .attr('text-anchor', 'middle')
            .attr('transform', (d: any) => // changed type to any
                'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')'
            )
            .text((d: WeightedWord) => d.text);

        const cloudy = document.querySelector('.bottle') as SVGElement;
        cloudy.setAttribute('style', 'animation: grow-fade-in 0.75s cubic-bezier(0.17, 0.67, 0, 1)'); // cubic-bezier(0.17, 0.67, 0.2, 1)

    }
}
