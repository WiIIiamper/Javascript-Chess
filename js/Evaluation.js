class Evaluation {
    static PieceValue = [0, 100, 300, 325, 500, 900, 0, -100, -300, -325, -500, -900, 0];

    static Evaluate(Board) {
        let score = 0;
        for (let rank = 7; rank >= 0; rank--) {
            for (let file = 0; file < 8; file++) {
                score += this.PieceValue[ Board.board[ getSquare(rank, file) ] ];
                let piece = Board.board[ getSquare(rank, file) ];

                switch( PieceType[piece] ) {
                    case PieceTypes.Pawn:
                        score += this.EvaluatePawn(Board, rank, file);
                        break;
                    case PieceTypes.Knight:
                        score += this.EvaluateKnight(Board, rank, file);
                        break;
                    case PieceTypes.Bishop:
                        score += this.EvaluateBishop(Board, rank, file);
                        break;
                    case PieceTypes.Rook:
                        score += this.EvaluateRook(Board, rank, file);
                        break;
                    case PieceTypes.Queen:
                        score += this.EvaluateQueen(Board, rank, file);
                        break;
                    case PieceTypes.King:
                        score += this.EvaluateKing(Board, rank, file);
                        break;
                }


            }
        }

        if (Board.sideToMove == SIDES.WHITE)
            return score;
        else
            return -score;
    }

    static EvaluatePawn(Board, rank, file) {
        let side = PieceColor[ Board.board[ getSquare(rank, file) ] ];
        let sq120 = side == SIDES.WHITE ? getSquare(7-rank, file) : getSquare(rank, file);
        let sq64 = SQ120ToSQ64(sq120);

        if (side == SIDES.WHITE) 
            return PawnTable[sq64];
        else 
            return (-PawnTable[sq64]);
    }
    static EvaluateKnight(Board, rank, file) {
        let side = PieceColor[ Board.board[ getSquare(rank, file) ] ];
        let sq120 = side == SIDES.WHITE ? getSquare(7-rank, file) : getSquare(rank, file);
        let sq64 = SQ120ToSQ64(sq120);

        if (side == SIDES.WHITE) 
            return KnightTable[sq64];
        else 
            return (-KnightTable[sq64]);
    }
    static EvaluateBishop(Board, rank, file) {
        let side = PieceColor[ Board.board[ getSquare(rank, file) ] ];
        let sq120 = side == SIDES.WHITE ? getSquare(7-rank, file) : getSquare(rank, file);
        let sq64 = SQ120ToSQ64(sq120);

        if (side == SIDES.WHITE) 
            return BishopTable[sq64];
        else 
            return (-BishopTable[sq64]);
    }
    static EvaluateRook(Board, rank, file) {
        let side = PieceColor[ Board.board[ getSquare(rank, file) ] ];
        let sq120 = side == SIDES.WHITE ? getSquare(7-rank, file) : getSquare(rank, file);
        let sq64 = SQ120ToSQ64(sq120);

        if (side == SIDES.WHITE) 
            return RookTable[sq64];
        else 
            return (-RookTable[sq64]);
    }
    static EvaluateQueen(Board, rank, file) {
        let side = PieceColor[ Board.board[ getSquare(rank, file) ] ];
        let sq120 = side == SIDES.WHITE ? getSquare(7-rank, file) : getSquare(rank, file);
        let sq64 = SQ120ToSQ64(sq120);

        if (side == SIDES.WHITE) 
            return QueenTable[sq64];
        else 
            return (-QueenTable[sq64]);
    }
    static EvaluateKing(Board, rank, file) {
        let side = PieceColor[ Board.board[ getSquare(rank, file) ] ];
        let sq120 = side == SIDES.WHITE ? getSquare(7-rank, file) : getSquare(rank, file);
        let sq64 = SQ120ToSQ64(sq120);

        if (side == SIDES.WHITE) 
            return KingTable[sq64];
        else 
            return (-KingTable[sq64]);
    }
}

const PawnTable = [
0,  0,  0,  0,  0,  0,  0,  0,
60, 60, 60, 60, 60, 60, 60, 60,
10, 10, 20, 30, 30, 20, 10, 10,
5,  5, 10, 25, 25, 10,  5,  5,
0,  0,  0, 20, 20,  0,  0,  0,
5, -5,-10,  0,  0,-10, -5,  5,
5, 10, 10,-20,-20, 10, 10,  5,
0,  0,  0,  0,  0,  0,  0,  0
];

const KnightTable = [
-50,-40,-30,-30,-30,-30,-40,-50,
-40,-20,  0,  0,  0,  0,-20,-40,
-30,  0, 10, 15, 15, 10,  0,-30,
-30,  5, 15, 20, 20, 15,  5,-30,
-30,  0, 15, 20, 20, 15,  0,-30,
-30,  5, 10, 15, 15, 10,  5,-30,
-40,-20,  0,  5,  5,  0,-20,-40,
-50,-40,-30,-30,-30,-30,-40,-50,
];

const BishopTable = [
-20,-10,-10,-10,-10,-10,-10,-20,
-10,  0,  0,  0,  0,  0,  0,-10,
-10,  0,  5, 10, 10,  5,  0,-10,
-10,  5,  5, 10, 10,  5,  5,-10,
-10,  0, 10, 10, 10, 10,  0,-10,
-10, 10, 10, 10, 10, 10, 10,-10,
-10,  5,  0,  0,  0,  0,  5,-10,
-20,-10,-10,-10,-10,-10,-10,-20,
];

const RookTable = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];

const QueenTable = [
-20,-10,-10, -5, -5,-10,-10,-20,
-10,  0,  0,  0,  0,  0,  0,-10,
-10,  0,  5,  5,  5,  5,  0,-10,
 -5,  0,  5,  5,  5,  5,  0, -5,
  0,  0,  5,  5,  5,  5,  0, -5,
-10,  5,  5,  5,  5,  5,  0,-10,
-10,  0,  5,  0,  0,  0,  0,-10,
-20,-10,-10, -5, -5,-10,-10,-20
];

const KingTable = [
-30,-40,-40,-50,-50,-40,-40,-30,
-30,-40,-40,-50,-50,-40,-40,-30,
-30,-40,-40,-50,-50,-40,-40,-30,
-30,-40,-40,-50,-50,-40,-40,-30,
-20,-30,-30,-40,-40,-30,-30,-20,
-10,-20,-20,-20,-20,-20,-20,-10,
 20, 20,  0,  0,  0,  0, 20, 20,
 20, 30, 10,  0,  0, 10, 30, 20
];

const WeakPawnTable = [
    0,   0,   0,   0,   0,   0,   0,   0,
    -10, -12, -14, -16, -16, -14, -12, -10,
    -10, -12, -14, -16, -16, -14, -12, -10,
    -10, -12, -14, -16, -16, -14, -12, -10,
    -10, -12, -14, -16, -16, -14, -12, -10,
    -8, -12, -14, -16, -16, -14, -12, -10,
    -8, -12, -14, -16, -16, -14, -12, -10,
    0,   0,   0,   0,   0,   0,   0,   0
  ];
  
  const PassedPawnTable = [
    0,   0,   0,   0,   0,   0,   0,   0,
    100, 100, 100, 100, 100, 100, 100, 100,
    80,  80,  80,  80,  80,  80,  80,  80,
    60,  60,  60,  60,  60,  60,  60,  60,
    40,  40,  40,  40,  40,  40,  40,  40,
    20,  20,  20,  20,  20,  20,  20,  20,
    20,  20,  20,  20,  20,  20,  20,  20,
    0,   0,   0,   0,   0,   0,   0,   0
  ];