var NO_MOVE = 0;

class HashTable {
    constructor() {
        this.numEntries = 4194319;
        this.entries = new Array(this.numEntries);

        for (let i = 0; i < this.numEntries; i++)
            this.entries[i] = {posKey: 0, move: NO_MOVE};
    }

    Probe(pos) {
        let index = Math.abs(pos.posKey) % this.numEntries;

        if ( this.entries[index].posKey == pos.posKey )
            return this.entries[index].move;
        return NO_MOVE;
    }

    Store(pos, move) {
        let index = Math.abs(pos.posKey) % this.numEntries;
        
        this.entries[index] = {posKey: pos.posKey, move: move};
    }
}

var HTable = new HashTable();

let ZobristKeys = new Array(13);
let CastleKeys = new Array(16);
let SideKey = 0;
InitZobrist(); 

function InitZobrist() {
    for (let piece = Pieces.Empty; piece <= Pieces.BlackKing; piece++) {
        ZobristKeys[piece] = new Array(120).fill(0);

        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                ZobristKeys[piece][ getSquare(rank, file) ] = RAND64();
            }
        }
    }

    for (let castlePerm = 0; castlePerm < 16; castlePerm++) {
        CastleKeys[castlePerm] = RAND64();
    }

    SideKey = RAND64();
}

function RAND64() {
    let random = 0;
    for (let bit = 0; bit < 64; bit++) {
        if ( Math.random() >= 0.5 )
            random |= ( 1 << bit );
    }
    return random;
}