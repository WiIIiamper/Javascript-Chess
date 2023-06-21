
class ChessBoard {
    constructor(FEN) {
        this.board = new Array(120).fill(Pieces.Empty);
        this.castlingRights = 0;
        this.enPassant = 0;
        this.fiftyMove = 0;
        this.ply = -1;
        this.moveHistory = [];
        this.posKey = 0;

        this.PieceCount = new Array(13).fill(0);
        this.PiecePos = new Array(13).fill( new Array(64).fill(0) );
        for (let piece = Pieces.WhitePawn; piece <= Pieces.BlackKing; piece++)
            this.PiecePos[piece] = new Array(64).fill(0);

        this.ParseFEN(FEN);
    }

    ParseFEN(FEN) {
        let FENParts = FEN.split(' ');
        this.ParsePiecePlacement(FENParts[0]);
        this.ParseSideToMove(FENParts[1]);
        this.ParseCastlingRights(FENParts[2]);
        this.ParseEnPassantSquare(FENParts[3]);
    }

    ParsePiecePlacement(FEN) {
        let rank = 7, file = 0, i = 0;
        for (i = 0; i < FEN.length; i++) {
            if ( FEN[i] == '/' ) {   
                rank--; file = 0;
            }
            else if ( FEN[i] >= '0' && FEN[i] <= '9' ) {
                let emptySquares = Number(FEN[i]), sq = file;
                for (; sq < file+emptySquares; sq++) {
                    ClearPiece(this, getSquare(rank, sq));
                }
                file = sq;
            } else {
                for (let piece = Pieces.WhitePawn; piece <= Pieces.BlackKing; piece++) {
                    if (FEN[i] == FENPiece[piece])
                        AddPiece(this, getSquare(rank, file), piece);
                }
                file++;
            }
        }
    }

    ParseSideToMove(FEN) {
        if ( FEN[0] == "w" ) {
            this.sideToMove = SIDES.WHITE;
            this.posKey ^= SideKey;
        }
        else
            this.sideToMove = SIDES.BLACK;
    }

    ParseCastlingRights(FEN) {
        for (let i = 0; i < FEN.length; i++) {
            switch( FEN[i] ) {
                case "Q":
                    this.castlingRights ^= CASTLE_RIGHT.WhiteQueen;
                    break;
                case "q":
                    this.castlingRights ^= CASTLE_RIGHT.BlackQueen;
                    break;
                case "K":
                    this.castlingRights ^= CASTLE_RIGHT.WhiteKing;
                    break;
                case "k":
                    this.castlingRights ^= CASTLE_RIGHT.BlackKing;
                    break;
                default:
                    break;
            }
        }
        this.posKey ^= CastleKeys[ this.castlingRights ];
    }

    ParseEnPassantSquare(FEN) {
        if ( FEN[0] != '-' ) {
            let file = FEN.charCodeAt(0) - ('a').charCodeAt();
            let rank = (Number(FEN[1]) - Number('1'));
            this.enPassant = getSquare(rank, file);
        }
        this.posKey ^= ZobristKeys[Pieces.Empty][ this.enPassant ];
    }

    isGameOver() {
        const moves = MoveGenerator.getMoves(Board);
        if (moves.length == 0) {
            console.log("GAME OVER!");
            return true;
        }
        return false;
    }

    MakeMove(move) {
        this.moveHistory[ ++this.ply ] = new MoveUndoer(move, this.enPassant, this.castlingRights, this.fiftyMove, this.posKey);
        this.posKey ^= ZobristKeys [Pieces.Empty ][ this.enPassant ];

        let fromSq = MoveGenerator.getStartingSquare(move);
        let toSq = MoveGenerator.getLandingSquare(move);
        let capture = MoveGenerator.getCapture(move);
        let promotion = MoveGenerator.getPromotion(move);
        AddPiece(this, toSq, this.board[fromSq]);
        ClearPiece(this, fromSq);
        if (promotion != Pieces.Empty)
            AddPiece(this, toSq, promotion);

        if (MoveGenerator.isEnPassantMove(move)) {
            this.makeEnPassantMove(fromSq, toSq);
        }
        this.enPassant = this.getEnPassantSquareAfterMove(fromSq, toSq);

        if (MoveGenerator.isCastleMove(move))
            this.makeCastleMove(toSq);

        this.UpdateCastlingPermissions(fromSq, toSq);

        this.UpdateFiftyMoveCounter(toSq, capture);

        this.sideToMove ^= 1;
        this.posKey ^= SideKey;
        this.posKey ^= ZobristKeys [Pieces.Empty ][ this.enPassant ];
    }

    getEnPassantSquareAfterMove(fromSquare, toSquare) {
        let pieceMoved = this.board[toSquare];
        let sideThatMoved = this.sideToMove;
        if ( PieceType[pieceMoved] == PieceTypes.Pawn ) {
            if (sideThatMoved == SIDES.WHITE && toSquare - fromSquare == 20) {
                return fromSquare+10;
            } else if (sideThatMoved == SIDES.BLACK && toSquare - fromSquare == -20)
                return fromSquare-10;
        }
        return 0;
    }

    makeEnPassantMove(fromSquare, toSquare) {
        let sideThatMoved = this.sideToMove;
        if (sideThatMoved == SIDES.WHITE) {
            ClearPiece(this, this.enPassant - 10);
        } else
            ClearPiece(this, this.enPassant + 10);
    }

    makeCastleMove(toSq) {
        switch(toSq) {
            case SQUARES.g1:
                ClearPiece(this, SQUARES.h1 );
                AddPiece(this, toSq-1, Pieces.WhiteRook);
                break;
            case SQUARES.c1:
                ClearPiece(this, SQUARES.a1 );
                AddPiece(this, toSq+1, Pieces.WhiteRook);
                break;
            case SQUARES.g8:
                ClearPiece(this, SQUARES.h8 );
                AddPiece(this, toSq-1, Pieces.BlackRook);
                break;
            case SQUARES.c8:
                ClearPiece(this, SQUARES.a8 );
                AddPiece(this, toSq+1, Pieces.BlackRook);
                break;
        }
    }

    UpdateCastlingPermissions(fromSq, toSq) {
        switch (fromSq) {
            case SQUARES.a1:
                this.removeCastlingPermission( CASTLE_RIGHT.WhiteQueen );
                break;
            case SQUARES.h1:
                this.removeCastlingPermission( CASTLE_RIGHT.WhiteKing );
                break;
            case SQUARES.a8:
                this.removeCastlingPermission( CASTLE_RIGHT.BlackQueen );
                break;
            case SQUARES.h8:
                this.removeCastlingPermission( CASTLE_RIGHT.BlackKing );
                break;
            case SQUARES.e1:
                this.removeCastlingPermission( CASTLE_RIGHT.WhiteKing );
                this.removeCastlingPermission( CASTLE_RIGHT.WhiteQueen );
                break;
            case SQUARES.e8:
                this.removeCastlingPermission( CASTLE_RIGHT.BlackKing );
                this.removeCastlingPermission( CASTLE_RIGHT.BlackQueen );
                break;
        }

        switch (toSq) {
            case SQUARES.a1:
                this.removeCastlingPermission( CASTLE_RIGHT.WhiteQueen );
                break;
            case SQUARES.h1:
                this.removeCastlingPermission( CASTLE_RIGHT.WhiteKing );
                break;
            case SQUARES.a8:
                this.removeCastlingPermission( CASTLE_RIGHT.BlackQueen );
                break;
            case SQUARES.h8:
                this.removeCastlingPermission( CASTLE_RIGHT.BlackKing );
                break;
        }
    }

    removeCastlingPermission(permission) {
        if ( (this.castlingRights & permission) != 0 ) {
            this.castlingRights ^= permission;
            this.posKey ^= CastleKeys[ permission ];
        }
    }

    UpdateFiftyMoveCounter(toSquare, capture) {
        this.fiftyMove++;
        if ( PieceType[ this.board[toSquare] ] == PieceTypes.Pawn )
            this.fiftyMove = 0;
        if ( capture != Pieces.Empty )
            this.fiftyMove = 0;
    }

    UndoMove() {
        let Undoer = this.moveHistory[ this.ply ];
        let move = Undoer.move;

        let fromSq = MoveGenerator.getStartingSquare(move);
        let toSq = MoveGenerator.getLandingSquare(move);
        let capture = MoveGenerator.getCapture(move);
        let promotion = MoveGenerator.getPromotion(move);
        AddPiece(this, fromSq, this.board[ toSq ]);
        AddPiece(this, toSq, capture);

        this.enPassant = Undoer.enPassant;
        this.castlingRights = Undoer.castleRights;
        this.fiftyMove = Undoer.fiftyMove;
        this.sideToMove ^= 1;

        if ( MoveGenerator.isEnPassantMove(move) ) {
            if ( this.sideToMove == SIDES.WHITE )
                AddPiece(this, this.enPassant - 10, Pieces.BlackPawn);
            else
                AddPiece(this, this.enPassant + 10, Pieces.WhitePawn);
        }

        if ( MoveGenerator.isCastleMove(move) ) {
            switch(toSq) {
                case SQUARES.g1:
                    AddPiece(this, SQUARES.h1, Pieces.WhiteRook);
                    ClearPiece(this, toSq-1);
                    break;
                case SQUARES.c1:
                    AddPiece(this, SQUARES.a1, Pieces.WhiteRook);
                    ClearPiece(this, toSq+1);
                    break;
                case SQUARES.g8:
                    AddPiece(this, SQUARES.h8, Pieces.BlackRook);
                    ClearPiece(this, toSq-1);
                    break;
                case SQUARES.c8:
                    AddPiece(this, SQUARES.a8, Pieces.BlackRook);
                    ClearPiece(this, toSq+1);
                    break;
            }
        }

        if (promotion != Pieces.Empty) {
            AddPiece(this, fromSq, this.sideToMove == SIDES.WHITE ? Pieces.WhitePawn : Pieces.BlackPawn)
        }

        this.ply--;
        this.posKey = Undoer.posKey;
    }

    PrintBoard() {
        if (this.sideToMove == SIDES.WHITE)
            console.log("White to move.");
        else if (this.sideToMove == SIDES.BLACK)
            console.log("Black to move.");

        for (let rank = 7; rank >= 0; rank--) {
            let rankString = "";
            for (let file = 0; file < 8; file++) {
                rankString += FENPiece[ this.board[ getSquare(rank, file) ] ] + " ";
            }
            console.log( rankString );
        }
        console.log("Castle Rights: " + this.castlingRights);
        if ( this.enPassant != 0 )
            console.log("EnPassantSquare: " + this.enPassant);
    }

    PrintMoves() {
        let moves = MoveGenerator.getMoves(this);
        console.log("Valid Moves: " + moves.length);
        for (let i = 0; i < moves.length; i++) {
            MoveGenerator.PrintMove(moves[i]);
        }
    }
}

class MoveUndoer {
    constructor(move, enPassant, castleRights, fiftyMove, posKey) {
        this.move = move;
        this.enPassant = enPassant;
        this.castleRights = castleRights;
        this.fiftyMove = fiftyMove;
        this.posKey = posKey;
    }
}