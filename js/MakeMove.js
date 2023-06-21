function AddPiece(pos, square, piece) {
    ClearPiece(pos, square);
    //console.log ("AddPiece " + square + " " + piece);
    pos.board[square] = piece;

    if (piece == Pieces.Empty)
        return;
    pos.posKey ^= ZobristKeys[piece][square];

    pos.PiecePos[piece][ pos.PieceCount[piece] ] = square;
    pos.PieceCount[piece]++;
}

function ClearPiece(pos, square) {
    let ClearedPiece = pos.board[square];
    pos.board[square] = Pieces.Empty;

    if (ClearedPiece == Pieces.Empty)
        return;
    pos.posKey ^= ZobristKeys[ClearedPiece][square];

    let PceCount = pos.PieceCount[ClearedPiece];
    for (let i = 0; i < PceCount; i++)
        if ( pos.PiecePos[ClearedPiece][i] == square ) {
            pos.PiecePos[ClearedPiece][i] = pos.PiecePos[ClearedPiece][ PceCount-1 ];
            break;
        }

    pos.PieceCount[ClearedPiece]--;
}
