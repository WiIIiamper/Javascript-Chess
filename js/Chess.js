const Pieces = { Empty: 0, WhitePawn: 1, WhiteKnight: 2, WhiteBishop: 3, WhiteRook: 4, WhiteQueen: 5, WhiteKing: 6,
    BlackPawn: 7, BlackKnight: 8, BlakcBishop: 9, BlackRook: 10, BlackQueen: 11, BlackKing: 12 };

const PieceTypes = { Empty: 0, Pawn: 1, Knight: 2, Bishop: 3, Rook: 4, Queen: 5, King: 6 };

const PieceType = [ PieceTypes.Empty, PieceTypes.Pawn, PieceTypes.Knight, PieceTypes.Bishop, PieceTypes.Rook, PieceTypes.Queen, PieceTypes.King,
    PieceTypes.Pawn, PieceTypes.Knight, PieceTypes.Bishop, PieceTypes.Rook, PieceTypes.Queen, PieceTypes.King ];

const FENPiece = [" ", "P", "N", "B", "R", "Q", "K", "p", "n", "b", "r", "q", "k"];
const SIDES = { WHITE: 0, BLACK: 1, NO_SIDE: 2 };
const PieceColor = [ SIDES.NO_SIDE, SIDES.WHITE, SIDES.WHITE, SIDES.WHITE, SIDES.WHITE, SIDES.WHITE, SIDES.WHITE,
    SIDES.BLACK, SIDES.BLACK, SIDES.BLACK, SIDES.BLACK, SIDES.BLACK, SIDES.BLACK, SIDES.BLACK];

const SQUARES = { a1: 21, h1: 28, a8: 91, h8: 98, e1: 25, e8: 95, c1: 23, g1: 27, c8: 93, g8: 97};

const CASTLE_RIGHT = { WhiteQueen: 1, WhiteKing: 2, BlackQueen: 4, BlackKing: 8 };

function getSquare(rank, file) {
    return rank*10 + file + 21;
}

function getRank(square) {
    return Math.floor(square/10)-2;
}
function getFile(square) {
    return (square % 10) - 1;
}

function getAlgeraicNotation(square) {
    let rank = Math.floor(square / 10) - 1;
    let file = square % 10 - 1;
    return String.fromCharCode(97 + file) + String(rank);
}

function SQ120ToSQ64(square) {
    return Math.floor(square/10)*8 + square%10 - 17;
}

function GameOver(pos) {
    let moves = MoveGenerator.getMoves(pos);
    if (moves.length == 0) {
        if (MoveGenerator.inCheck(pos, pos.sideToMove))
            return "checkmate";
        return "stalemate";
    }

    if (pos.fiftyMove >= 100)
        return "50-move rule";

    let repetitions = 0;
    for (let i = pos.ply; i >= 0; i--) {
        if ( pos.posKey == pos.moveHistory[i].posKey ) {
            repetitions++;
            if (repetitions == 2) 
                return "repetition";
        }
    }

    return false;
}