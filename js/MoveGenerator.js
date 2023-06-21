
class MoveGenerator {
    static DiagonalMovement = [9, -9, 11, -11];
    static StraightMovement = [10, -10, 1, -1];
    static LMovement = [21, 12, -8, -19, -21, -12, 8, 19];
    static KingMovement = [9, -9, 11, -11, 10, -10, 1, -1];

    static getMoves(pos) {
        const moves = [];

        for (let rank = 7; rank >= 0; rank--) {
            for (let file = 0; file < 8; file++) {
                let square = getSquare(rank, file);
                let piece = pos.board[square];
                if ( PieceColor[piece] == pos.sideToMove ) {
                    this.generateMoves(pos, moves, square);
                }
            }
        }

        return moves;
    }

    static generateMoves(pos, moves, square) {
        switch(PieceType[ pos.board[square] ]) {
            case PieceTypes.Pawn:
                this.generatePawnMoves(pos, moves, square);
                break;
            case PieceTypes.Knight:
                this.generateKnightMoves(pos, moves, square);
                break;
            case PieceTypes.Bishop:
                this.generateDiagonalSlides(pos, moves, square);
                break;
            case PieceTypes.Rook:
                this.generateStraightSlides(pos, moves, square);
                break;
            case PieceTypes.Queen:
                this.generateDiagonalSlides(pos, moves, square);
                this.generateStraightSlides(pos, moves, square);
                break;
            case PieceTypes.King:
                this.generateKingMoves(pos, moves, square);
                break;
        }
    }

    static generateKingMoves(pos, moves, square) {
        for (let dir = 0; dir < this.KingMovement.length; dir++) {
            let toSquare = square + this.KingMovement[dir];
            if ( this.isOnTheBoard(toSquare) && PieceColor[ pos.board[toSquare] ] != PieceColor[ pos.board[square] ] )
                this.AddMoveIfValid( pos, moves, square, toSquare, false, false );
        }

        this.generateCastles(pos, moves, square);
    }

    static generateCastles(pos, moves, square) {
        if (this.inCheck(pos, pos.sideToMove))
            return;

        let QueenSide = pos.sideToMove == SIDES.WHITE ? CASTLE_RIGHT.WhiteQueen : CASTLE_RIGHT.BlackQueen;
        let KingSide = pos.sideToMove == SIDES.WHITE ? CASTLE_RIGHT.WhiteKing : CASTLE_RIGHT.BlackKing;

        if ( (pos.castlingRights & KingSide) != 0 ) {
            if (pos.board[square+1] == Pieces.Empty && pos.board[square+2] == Pieces.Empty)
                if ( !this.isSquareAttacked(pos, square+1, pos.sideToMove^1) )
                    this.AddMoveIfValid(pos, moves, square, square+2, true, false);
        }
        if ( (pos.castlingRights & QueenSide) != 0 ) {
            if (pos.board[square-1] == Pieces.Empty && pos.board[square-2] == Pieces.Empty && pos.board[square-3] == Pieces.Empty)
                if ( !this.isSquareAttacked(pos, square-1, pos.sideToMove^1) )
                    this.AddMoveIfValid(pos, moves, square, square-2, true, false);
        }
    }

    static generateStraightSlides(pos, moves, square) {
        for (let dir = 0; dir < this.StraightMovement.length; dir++) {
            this.generateSlides(pos, moves, square, this.StraightMovement[dir]);
        }
    }

    static generateDiagonalSlides(pos, moves, square) {
        for (let dir = 0; dir < this.DiagonalMovement.length; dir++) {
            this.generateSlides(pos, moves, square, this.DiagonalMovement[dir]);
        }
    }

    static generateSlides(pos, moves, square, direction) {
        for ( let sq = square+direction; this.isOnTheBoard(sq); sq += direction ) {
            if ( pos.board[sq] != Pieces.Empty ) {
                if ( PieceColor[ pos.board[sq] ] != PieceColor[ pos.board[square] ] )
                    this.AddMoveIfValid(pos, moves, square, sq, false, false);
                break;
            }

            this.AddMoveIfValid(pos, moves, square, sq, false, false);
        }
    }

    static generateKnightMoves(pos, moves, square) {
        for (let dir = 0; dir < this.LMovement.length; dir++) {
            let toSquare = square + this.LMovement[dir];
            if ( !this.isOnTheBoard(toSquare) )
                continue;

            if ( PieceColor[ pos.board[square] ] != PieceColor[ pos.board[toSquare] ] ) {
                this.AddMoveIfValid(pos, moves, square, toSquare, false, false);
            }
        }
    }

    static generatePawnMoves(pos, moves, square) {
        let side = pos.sideToMove;
        let direction = side == SIDES.WHITE ? 10 : -10;

        if ( pos.board[ square + direction ] == Pieces.Empty ) {
            this.AddPawnMoveIfValid(pos, moves, square, square+direction, false, false);

            if ( !this.PawnHasMoved(pos, square) && pos.board[ square + 2*direction ] == Pieces.Empty ) 
                this.AddPawnMoveIfValid(pos, moves, square, square+2*direction, false, false);
        }

        let captureLeft = side == SIDES.WHITE ? 9: -11;
        let captureRight = side == SIDES.WHITE ? 11 : -9;
        
        if ( this.isOnTheBoard( square+captureLeft ) ) {
            if ( PieceColor[ pos.board[ square + captureLeft ] ] == (side^1) )
                this.AddPawnMoveIfValid(pos, moves, square, square+captureLeft, false, false);

            if ( (square + captureLeft) == pos.enPassant ) 
                this.AddPawnMoveIfValid(pos, moves, square, square+captureLeft, false, true);
        }
        if ( this.isOnTheBoard( square+captureRight ) ) {
            if ( PieceColor[ pos.board[ square + captureRight ] ] == (side^1) )
                this.AddPawnMoveIfValid(pos, moves, square, square+captureRight, false, false);

            if ( (square + captureRight) == pos.enPassant ) 
                this.AddPawnMoveIfValid(pos, moves, square, square+captureRight, false, true);
        }

    }

    static PawnHasMoved(pos, square) {
        let rank = Math.floor(square / 10) - 2;
        if ( pos.sideToMove == SIDES.WHITE && rank == 1 )
            return false;
        if ( pos.sideToMove == SIDES.BLACK && rank == 6 )
            return false;
        return true;
    }

    static isSquareAttacked(pos, square, side) {
        if (this.isSquareAttackedBySlider(pos, square, side))
            return true;
        if (this.isSquareAttackedByKnight(pos, square, side))
            return true;
        if (this.isSquareAttackedByPawn(pos, square, side))
            return true;
        if (this.isSquareAttackedByKing(pos, square, side))
            return true;
        return false;
    }

    static isSquareAttackedBySlider(pos, square, side) {
        for (let dir = 0; dir < this.StraightMovement.length; dir++) {
            let vector = this.StraightMovement[dir];
            for (let sq = square+vector; this.isOnTheBoard(sq); sq += vector) {
                let piece = pos.board[sq];
                if ( piece != Pieces.Empty ) {
                    if ( (PieceType[piece] == PieceTypes.Queen || PieceType[piece] == PieceTypes.Rook) && PieceColor[piece] == side )
                        return true;
                    break;
                }
            }
        }

        for (let dir = 0; dir < this.DiagonalMovement.length; dir++) {
            let vector = this.DiagonalMovement[dir];
            for (let sq = square+vector; this.isOnTheBoard(sq); sq += vector) {
                let piece = pos.board[sq];
                if ( piece != Pieces.Empty ) {
                    if ( (PieceType[piece] == PieceTypes.Queen || PieceType[piece] == PieceTypes.Bishop) && PieceColor[piece] == side )
                        return true;
                    break;
                }
            }
        }
        return false;
    }

    static isSquareAttackedByKnight(pos, square, side) {
        for (let dir = 0; dir < this.LMovement.length; dir++) {
            let attackerSquare = square + this.LMovement[dir];
            if ( !this.isOnTheBoard(attackerSquare) )
                continue;

            let attackerPiece = pos.board[attackerSquare];
            if ( PieceType[attackerPiece] == PieceTypes.Knight && PieceColor[attackerPiece] == side )
                return true;
        }
        return false;
    }

    static isSquareAttackedByPawn(pos, square, side) {
        let attackerLeft = side == SIDES.WHITE ? square-11 : square+9;
        let attackerRight = side == SIDES.WHITE ? square-9 : square+11;

        if ( this.isOnTheBoard(attackerLeft) ) {
            let attackerPiece = pos.board[attackerLeft];
            if (PieceType[attackerPiece] == PieceTypes.Pawn && PieceColor[attackerPiece] == side)
                return true;
        }
        if ( this.isOnTheBoard(attackerRight) ) {
            let attackerPiece = pos.board[attackerRight];
            if (PieceType[attackerPiece] == PieceTypes.Pawn && PieceColor[attackerPiece] == side)
                return true;
        }

        return false;
    }

    static isSquareAttackedByKing(pos, square, side) {
        for (let dir = 0; dir < this.KingMovement.length; dir++) {
            let attackerSquare = square + this.KingMovement[dir];
            if ( !this.isOnTheBoard(attackerSquare) )
                continue;

            let attackerPiece = pos.board[attackerSquare];
            if ( PieceType[attackerPiece] == PieceTypes.King && PieceColor[attackerPiece] == side )
                return true;
        }
        return false;
    }

    static inCheck(pos, side) {
        if (side == SIDES.WHITE)
            return this.isSquareAttacked(pos, pos.PiecePos[ Pieces.WhiteKing ][0], side^1 );
        else 
            return this.isSquareAttacked(pos, pos.PiecePos[ Pieces.BlackKing ][0], side^1 );

        return false;
    }

    static AddMoveIfValid(pos, moves, fromSquare, toSquare, castle, enPassant) {
        let capture = pos.board[toSquare];
        let move = this.createMove(fromSquare, toSquare, capture, Pieces.Empty, castle, enPassant);

        pos.MakeMove(move);
        if (!this.inCheck(pos, pos.sideToMove^1))
            moves.push(move);
        pos.UndoMove();
    }

    static AddPawnMoveIfValid(pos, moves, fromSquare, toSquare, castle, enPassant) {
        if (getRank(toSquare) != 0 && getRank(toSquare) != 7) {
            this.AddMoveIfValid(pos, moves, fromSquare, toSquare, castle, enPassant);
            return;
        }

        let capture = pos.board[toSquare];
        let Queen = pos.sideToMove == SIDES.WHITE ? Pieces.WhiteQueen : Pieces.BlackQueen;
        let Rook = pos.sideToMove == SIDES.WHITE ? Pieces.WhiteRook : Pieces.BlackRook;
        let Knight = pos.sideToMove == SIDES.WHITE ? Pieces.WhiteKnight : Pieces.BlackKnight;
        let Bishop = pos.sideToMove == SIDES.WHITE ? Pieces.WhiteBishop : Pieces.BlakcBishop;

        let move = this.createMove(fromSquare, toSquare, capture, Queen, castle, enPassant);
        pos.MakeMove(move);
        if (!this.inCheck(pos, pos.sideToMove^1)) {
            moves.push(move);
            moves.push( this.createMove(fromSquare, toSquare, capture, Rook, castle, enPassant) );
            moves.push( this.createMove(fromSquare, toSquare, capture, Knight, castle, enPassant) );
            moves.push( this.createMove(fromSquare, toSquare, capture, Bishop, castle, enPassant) );
        }
        pos.UndoMove();
    }

    static createMove(fromSquare, toSquare, capture, promotion, castle, enPassant) {
        let move = fromSquare;
        move |= ( toSquare << 7 );
        move |= ( capture << 14 );
        move |= ( promotion << 18 );
        move |= ( castle << 22 );
        move |= ( enPassant << 23 );
        return move;
    }

    static getStartingSquare(move) {
        return move & 127; // returns first 7 bits
    }
    static getLandingSquare(move) {
        return (move >> 7) & 127;
    }
    static getCapture(move) {
        return (move >> 14) & 15;
    }
    static getPromotion(move) {
        return (move >> 18) & 15;
    }
    static isCastleMove(move) {
        return (move >> 22) & 1 == 1;
    }
    static isEnPassantMove(move) {
        return (move >> 23) & 1 == 1;
    }

    static PrintMove(move) {
        let fromSquare = MoveGenerator.getStartingSquare( move );
        let toSquare = MoveGenerator.getLandingSquare( move );
        let moveString = getAlgeraicNotation(fromSquare) + getAlgeraicNotation(toSquare);
        console.log(moveString);
    }

    static StrMove(move) {
        let fromSquare = MoveGenerator.getStartingSquare( move );
        let toSquare = MoveGenerator.getLandingSquare( move );
        return getAlgeraicNotation(fromSquare) + getAlgeraicNotation(toSquare);
    }

    static isOnTheBoard(square) {
        if (square < 21 || square > 98)
            return false;
        if (square % 10 == 9 || square % 10 == 0)
            return false;
        return true;
    }
}