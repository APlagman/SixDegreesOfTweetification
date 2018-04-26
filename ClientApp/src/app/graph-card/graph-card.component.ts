import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EndpointService } from '../services/endpoint.service';
import { Subject } from 'rxjs/Subject';
import { UserResult } from '../models/UserResult';
import { switchMap, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { Link } from '../services/graph-data.service';

@Component({
    selector: 'app-graph-card',
    templateUrl: './graph-card.component.html',
    styleUrls: ['./graph-card.component.scss']
})
export class GraphCardComponent implements OnInit, OnChanges {

    @Input() nodeData;
    @Input() whatToWhat;
    @Input() links;
    cardTitle: string;
    cardBody = [];
    userData: Subject<any> = new Subject<any>();
    constructor(private endpoint: EndpointService) { }

    ngOnInit() {
        this.userData.pipe(
            switchMap((data: { id }) => this.endpoint.getUserInfo(data.id)
                .pipe(
                    catchError(err => Observable.empty<UserResult>())
                )
            )).subscribe((result: UserResult) => {
                this.nodeData.user = result;
                this.updateCardContent(this.nodeData);
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        const data = changes['nodeData'];
        if (data.currentValue) {
            this.updateCardContent(data.currentValue);
        }
    }

    updateCardContent(data) {
        this.cardBody = [];

        if (data.user) {
            this.cardTitle = '@' + data.user.screenName;
            for (const [key, value] of Object.entries(data.user)) {
                if (key === 'profileImage') {
                    continue;
                }
                if (key && value) {
                    this.cardBody.push([key.toString(), value.toString()]);
                }

            }
        } else if (data.isUser) {

            this.userData.next(data);

        } else {
            const connectedWords: string[] = this.links
                .filter((link) => link.source.id === data.id || link.target.id === data.id)
                .map((link) => (link.source.id === data.id) ? link.target.id : link.source.id);
            this.cardTitle = '#' + data.id;
            this.cardBody.push('Connected To:');
            connectedWords.forEach((hash) => {
                this.cardBody.push('#' + hash);
            });
        }


    }

    showTimeData(data, metadata) { // TODO: find a place to show this
        this.cardTitle = data.id;
        const { calls, time } = metadata;
        const [hours, minutes, seconds] = time.toLocaleString().split(':');
        this.cardBody.push(['Calls:', `${calls}`]);
        this.cardBody.push(['Time Taken:', '']);
        this.cardBody.push(['Hours', hours]);
        this.cardBody.push(['Minutes', minutes]);
        this.cardBody.push(['Seconds', seconds]);
    }

}