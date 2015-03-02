let mixin = require('./mixin');

require('should');

function Spy() {
    this.logs = {};
}

Spy.prototype.log = function(data) {
    this.logs[data] = this.logs[data] ? this.logs[data] + 1 : 1;
};
Spy.prototype.check = function(data, nb = 1) {
    if (!this.logs[data])
        throw Error(`Expected "${data}" ${nb} time(s) but could not find it`);
    else if (this.logs[data] !== nb)
        throw Error(`Expected "${data}" ${nb} time(s) but got it ${this.logs[data]} time(s) instead`);
};

let spy,
    piano = {
        name: 'piano',

        init: function() {

        },

        class: {
            play: function() {
                spy.log('Piano played');
            }
        }
    };

describe('mixin', function() {

    beforeEach(function() {
        spy = new Spy();
    });

    it('should make an electric piano', function() {
        let electicPiano = {
            play: function() {
                spy.log('Electric play');
                this._mixinCall('piano', 'play');
            }
        };

        mixin(electicPiano, [piano]);

        electicPiano.play();
        spy.check('Electric play');
        spy.check('Piano played');
    });

    it('should not work on unnamed mixins', function() {
        (function() {
            mixin({}, [{
                class: {
                    a: 'a ha!'
                }
            }]);
        }).should.throw('Some mixins do not have a name and cannot be used');
    });
});