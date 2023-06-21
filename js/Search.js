class BOT {
    static MVVLVAVictim = [0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600];
    static MVVLVAAttacker = [0, 60, 50, 40, 30, 20, 10, 60, 50, 40, 30, 20, 10];

    static nodes = 0;
    static betaCuttoffs = 0; 
    static betaCuttoffsOnFirstMove = 0;
    static infinity = 9999999;
    static MATE = 1000000;

    static startingTime = 0;
    static TimeLimit = 500;
    static TimeUp = false;

    static SearchBestMove(Board, TimeLeft) {        
        this.nodes = 0;
        this.betaCuttoffs = 0;
        this.betaCuttoffsOnFirstMove = 0;
        this.startingTime = Date.now();
        this.TimeLimit = TimeLeft / 30;
        this.TimeUp = false;

        let result = this.IterativeDeepening(Board);

        console.log("Nodes: " + this.nodes + " NPS: " + Math.floor( this.nodes / ((Date.now()-this.startingTime)/1000) ) +
                    " Ordering: " + ((this.betaCuttoffsOnFirstMove / this.betaCuttoffs)*100).toFixed(2) + "%"
                    + " Beta Cuttoffs: " + this.betaCuttoffs + " Beta Cuttoffs on first move: " + this.betaCuttoffsOnFirstMove );

        console.log( this.PrintPrincipalVariation(Board) );
        return result;
    }

    static IterativeDeepening(pos) {
        let BestMove = 0;
        console.log("Searching Position");
        for (let depth = 1; depth <= 64; depth++) {
            let currBestMove, currBestScore;
            currBestScore = this.Search(pos, depth, -this.infinity, this.infinity);
            currBestMove = HTable.Probe(pos);

            if (this.TimeUp)
                return BestMove;
            BestMove = currBestMove;

            console.log("depth " + depth + " Move " + MoveGenerator.StrMove(currBestMove) + " Score:" + currBestScore
                + " Nodes: " + this.nodes );
        }
        return BestMove;
    }

    static Search(pos, depth, alpha, beta) {
        if (depth <= 0)
            return this.qsearch(pos, alpha, beta);

        this.CheckTimeUp();
        let oldAlpha = alpha;

        let moves = MoveGenerator.getMoves(pos);

        let GameOver = this.isGameOver(pos, moves, depth);
        if (GameOver != this.infinity)
            return GameOver;

        moves = this.OrderMoves(pos, moves);
        let BestMove = NO_MOVE, MoveScore;
        for (let i = 0; i < moves.length; i++) {
            pos.MakeMove(moves[i]);
            MoveScore = -this.Search(pos, depth-1, -beta, -alpha);
            pos.UndoMove();

            if (this.TimeUp == true)
                return 0;

            if (MoveScore > alpha) {
                alpha = MoveScore;
                BestMove = moves[i];
            }
            if (alpha > beta) {
                if (i == 0)
                    this.betaCuttoffsOnFirstMove++;
                this.betaCuttoffs++;
                return beta;
            }
        }

        if (alpha != oldAlpha) {
            HTable.Store(pos, BestMove);
        }

        return alpha;
    }

    static qsearch(pos, alpha, beta) {
        this.nodes++;
        let stadPad = Evaluation.Evaluate(pos);
        return stadPad;
    }

    static CheckTimeUp() {
        // only checks every 2048 nodes
        if ((this.nodes & 2047) != 0)
            return false;
        if ( (Date.now() - this.startingTime) > this.TimeLimit ) {
            this.TimeUp = true;
            return true;
        }
    }

    static OrderMoves(pos, moves) {
        let moveScore = [];
        for (let i = 0; i < moves.length; i++) {
            let score = 0;
            let capture = MoveGenerator.getCapture(moves[i]);
            if (capture != Pieces.Empty) {
                score += 1000000;
                score += this.MVVLVAVictim[ capture ];
                score += this.MVVLVAAttacker[ pos.board[ MoveGenerator.getStartingSquare(moves[i]) ] ];
            }

            moveScore.push( [moves[i], score] );
        }
        
        moveScore.sort(function(a, b) { return b[1]-a[1] } );
        for (let i = 0; i < moves.length; i++) 
            moves[i] = moveScore[i][0];
        return moves;
    }

    static isGameOver(pos, moves, depth) {
        if (pos.fiftyMove >= 100)
            return 0;

        let repetitions = 0;
        for (let i = pos.ply; i >= pos.ply - pos.fiftyMove && i >= 0; i--) {
            if ( pos.posKey == pos.moveHistory[i].posKey ) {
                repetitions++;
                if (repetitions == 2) 
                    return 0;
            }
        }

        if (moves.length == 0) {
            if (MoveGenerator.inCheck(pos, pos.sideToMove))
                return -this.MATE - depth;
            return 0;
        }

        return this.infinity;
    }

    static PrintPrincipalVariation(pos) {
        let PV = "";

        let PVLength = 0;
        while ( HTable.Probe(pos) != NO_MOVE ) {
            let move = HTable.Probe(pos);
            PV += MoveGenerator.StrMove(move) + " ";
            PVLength++;
            pos.MakeMove(move);
        }

        while (PVLength--) {
            pos.UndoMove();
        }
        
        return PV;
    }
}