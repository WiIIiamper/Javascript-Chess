function Perft(Board, depth) {
    let moves = MoveGenerator.getMoves(Board);
    if (depth == 1)
        return moves.length;

    let res = 0;
    for (let i = 0; i < moves.length; i++) {
        Board.MakeMove( moves[i] );
        res += Perft(Board, depth-1);
        Board.UndoMove(); 
    }
    return res;
}

function PerftTesting() {
    let startingTime = Date.now();
    console.log("Starting Perft Test!");

    let Board = new ChessBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    console.log("Starting Position");
    for (let i = 1; i <= 5; i++) {
        console.log( "Depth " + i + ": " + Perft(Board, i) );
    }

    Board = new ChessBoard("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - ");
    console.log("Kiwipete");
    for (let i = 1; i <= 4; i++) {
        console.log( "Depth " + i + ": " + Perft(Board, i) );
    }

    Board = new ChessBoard("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - ");
    console.log("Position 3");
    for (let i = 1; i <= 5; i++) {
        console.log( "Depth " + i + ": " + Perft(Board, i) );
    }

    Board = new ChessBoard("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1");
    console.log("Position 4");
    for (let i = 1; i <= 4; i++) {
        console.log( "Depth " + i + ": " + Perft(Board, i) );
    }

    Board = new ChessBoard("r2q1rk1/pP1p2pp/Q4n2/bbp1p3/Np6/1B3NBn/pPPP1PPP/R3K2R b KQ - 0 1");
    console.log("Position 4 Mirrored with same Perft results");
    for (let i = 1; i <= 4; i++) {
        console.log( "Depth " + i + ": " + Perft(Board, i) );
    }

    Board = new ChessBoard("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8  ");
    console.log("Position 5");
    for (let i = 1; i <= 4; i++) {
        console.log( "Depth " + i + ": " + Perft(Board, i) );
    }

    Board = new ChessBoard("r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10 ");
    console.log("Position 6");
    for (let i = 1; i <= 4; i++) {
        console.log( "Depth " + i + ": " + Perft(Board, i) );
    }

    console.log("Performance: " + (Date.now() - startingTime) + "ms.");
}

PerftTesting();