InitializeGUI()

let HumanColor, BotColor;
let TimeControl;
let HumanTimeControl, BotTimeControl, TimeStarted;
let HumanTimeLeft = 0, BotTimeLeft = 0;
let FlippedBoard = false;
let GameRunning = false;
let Board;

let Ply;
let MoveTimestamps = [];

let currSelectedSquare = 0;

function Play() {
    let startingPositionFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    Board = new ChessBoard(startingPositionFEN);
    
    if (currSelectedSquare != 0) {
        document.getElementById('square' + currSelectedSquare).classList.remove('selected-square');
        currSelectedSquare = 0;
    }
    document.getElementById('game-over-component').style.display = "none";

    Ply = -1;
    MoveTimestamps = [];

    GetHumanColor();
    GetTimeControlInfo();
    UpdatePieces();
    UpdatePlayerLabels();
    InitializeBOT();
    GameRunning = true;
}

function InitializeBOT() {
    let RoBOT = setInterval( function(){
        if (!GameRunning) {
            clearInterval(RoBOT);
            console.log("ClearInterval");
            return;
        }

        if ( Board.sideToMove == BotColor ) {
            let BOTMove = BOT.SearchBestMove(Board, BotTimeLeft);
            Board.MakeMove(BOTMove);
            UpdatePieces();
            MoveTimestamps[++Ply] = Date.now();
            UpdateBotTimer();
            CheckIfGameOver();
        }
    }, 30);
}

function UpdateBotTimer() {
    let MoveTime = MoveTimestamps[Ply] - MoveTimestamps[Ply-1];
    BotTimeLeft -= MoveTime;

    let minutes = Math.floor(BotTimeLeft / (1000 * 60));
    let seconds = Math.floor((BotTimeLeft % ( (1000*60) )) / 1000);

    document.getElementById(BotTimerID()).innerHTML = minutes + ":" + seconds;
}
function UpdateHumanTimer() {
    let MoveTime = MoveTimestamps[Ply] - MoveTimestamps[Ply-1];
    HumanTimeLeft -= MoveTime;

    let minutes = Math.floor(HumanTimeLeft / (1000 * 60));
    let seconds = Math.floor((HumanTimeLeft % ( (1000*60) )) / 1000);

    document.getElementById(HumanTimerID()).innerHTML = minutes + ":" + seconds;
}

function GetHumanColor() {
    if (document.getElementById("Choose-Side").value == 2) 
        HumanColor = Math.floor( Math.random() * 2 );
    else 
        HumanColor = document.getElementById("Choose-Side").value;
    
    BotColor = HumanColor ^ 1;

    if ( (HumanColor == SIDES.WHITE && FlippedBoard) || ( HumanColor == SIDES.BLACK && !FlippedBoard ) )
        FlipBoard();
}

function GetTimeControlInfo() {
    HumanTimeLeft = HumanTimeControl = document.getElementById("TimeControlHuman").value;
    BotTimeLeft = BotTimeControl = document.getElementById("TimeControlBot").value;
    MoveTimestamps[++Ply] = Date.now();

    let minutes = Math.floor(BotTimeControl / (1000 * 60));
    let seconds = Math.floor((BotTimeControl % ( (1000*60) )) / 1000);

    document.getElementById(BotTimerID()).innerHTML = minutes + ":" + seconds;

    TimeControl = setInterval(function() {
        if (!GameRunning)
            return;
        if ( Board.sideToMove == BotColor )
            return;

        let TimeSinceLastMove = Date.now() - MoveTimestamps[Ply];
        let TimeRemaining = HumanTimeLeft - TimeSinceLastMove;

        let minutes = Math.floor(TimeRemaining / (1000 * 60));
        let seconds = Math.floor((TimeRemaining % ( (1000*60) )) / 1000);

        document.getElementById(HumanTimerID()).innerHTML = minutes + ":" + seconds;
    }, 150);
}

function HumanTimerID() {
    if ( (SIDES.WHITE == HumanColor) == FlippedBoard )
        return 'timer-top';
    else
        return 'timer-bottom';
}
function BotTimerID() {
    if ( (SIDES.WHITE == HumanColor) == FlippedBoard )
        return 'timer-bottom';
    else
        return 'timer-top';
}

function SelectSquare(squareElement) {
    if (!GameRunning)
        return;
    
    let squareIdx = Number( squareElement.id.substring(6) );
    if (currSelectedSquare != 0)
        document.getElementById('square' + currSelectedSquare).classList.remove('selected-square');
    squareElement.classList.add('selected-square');

    UnhighlightPossibleMoves();
    const moves = MoveGenerator.getMoves(Board);
    HighlightPossibleMoves(squareIdx, moves);

    TryToMakeMove(currSelectedSquare, squareIdx, moves);

    currSelectedSquare = squareIdx;
}

function HighlightPossibleMoves(square, moves) {
    for (let i = 0; i < moves.length; i++) {
        let fromSquare = MoveGenerator.getStartingSquare( moves[i] );
        let toSquare = MoveGenerator.getLandingSquare( moves[i] );
        if (fromSquare == square) {
            if (Board.board[toSquare] == Pieces.Empty) {
                let PossibleMoveMarker = document.createElement("div");
                PossibleMoveMarker.classList.add('possible-move-marker');
                document.getElementById('square'+toSquare).appendChild(PossibleMoveMarker);
            } else {
                document.getElementById('square'+toSquare).classList.add('possible-capture-marker');
            }
        }
    }
}

function UnhighlightPossibleMoves() {
    let currentlyHighlighted = document.getElementsByClassName('possible-move-marker');
    while (currentlyHighlighted.length != 0) {
        currentlyHighlighted[0].remove();
    }
    currentlyHighlighted = document.getElementsByClassName('possible-capture-marker');
    while (currentlyHighlighted.length != 0) {
        currentlyHighlighted[0].classList.remove('possible-capture-marker');
    }
}

function TryToMakeMove(from, to, moves) {
    for (let i = 0; i < moves.length; i++) {
        let fromSquare = MoveGenerator.getStartingSquare( moves[i] );
        let toSquare = MoveGenerator.getLandingSquare( moves[i] );
        if (fromSquare == from && toSquare == to ) {
            Board.MakeMove(moves[i]);
            UpdatePieces();
            MoveTimestamps[++Ply] = Date.now();
            UpdateHumanTimer();
            CheckIfGameOver();
            return true;
        }
    }
    return false;
}

function CheckIfGameOver() {
    if (!GameRunning)
        return;

    let isGameOver = GameOver(Board);
    if (isGameOver != false) {
        if (isGameOver == "checkmate")
            document.getElementById('game-over-title').innerHTML = "Game Over";
        else
            document.getElementById('game-over-title').innerHTML = "Draw";

        document.getElementById('game-over-component').innerHTML += "by " + isGameOver;
        document.getElementById('game-over-component').style.display = "inline-block";
        GameRunning = false;
    }
}

const PieceImgName = [ "", "wp", "wn", "wb", "wr", "wq", "wk", "bp", "bn", "bb", "br", "bq", "bk" ];
function UpdatePieces() {
    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
            let squareIdx = getSquare(rank, file);
            let SquareDiv = document.getElementById('square' + squareIdx);
            SquareDiv.innerHTML = '';

            let piece = Board.board[squareIdx];
            if ( piece != Pieces.Empty ) {
                let pieceImg = document.createElement("img");
                pieceImg.src = ".\\resources\\pieces\\" + PieceImgName[piece] + ".png";
                pieceImg.classList.add("piece-img");
                SquareDiv.appendChild(pieceImg);
            }
        }
    }
}

function UpdatePlayerLabels() {
    if ( (HumanColor == SIDES.WHITE) == FlippedBoard ) {
        document.getElementById('player-top-name').innerHTML = "YOU";
        document.getElementById('player-bottom-name').innerHTML = "BOT";
    } else {
        document.getElementById('player-top-name').innerHTML = "BOT";
        document.getElementById('player-bottom-name').innerHTML = "YOU";
    }

    let minutes = Math.floor(BotTimeLeft / (1000 * 60));
    let seconds = Math.floor((BotTimeLeft % ( (1000*60) )) / 1000);
    document.getElementById(BotTimerID()).innerHTML = minutes + ":" + seconds;

    minutes = Math.floor(HumanTimeLeft / (1000 * 60));
    seconds = Math.floor((HumanTimeLeft % ( (1000*60) )) / 1000);
    document.getElementById(HumanTimerID()).innerHTML = minutes + ":" + seconds;
}

function FlipBoard() {
    FlippedBoard = !FlippedBoard;
    let SquareDivs = document.getElementsByClassName('square');
    for (let i = 0; i < SquareDivs.length; i++) {
        let currTop = SquareDivs[i].style.top.substring(0, SquareDivs[i].style.top.length -1);
        let currLeft = SquareDivs[i].style.left.substring(0, SquareDivs[i].style.left.length -1);
        SquareDivs[i].style.top = (87.5-currTop) + "%";
        SquareDivs[i].style.left = (87.5-currLeft) + "%";
    }

    UpdatePlayerLabels();
}

function UndoMove() {
    if (!GameRunning)
        return;

    if (Board.ply >= 0)
        Board.UndoMove();
    if (Board.ply >= 0)
        Board.UndoMove();
    UpdatePieces();
}

function InitializeGUI() {
    AddSquareDivs();
}

function AddSquareDivs() {
    let ChessBoardDiv = document.getElementsByClassName('chess-board')[0];
    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++ ) 
            AddSquare(ChessBoardDiv, rank, file);
    }
}

function AddSquare(ChessBoardDiv, rank, file) {
    let squareIdx = getSquare(rank, file);
    let SquareDiv = document.createElement("div");
    SquareDiv.id = "square" + squareIdx;
    SquareDiv.classList.add("square");

    let squareSize = 12.5;
    SquareDiv.style.width = SquareDiv.style.height = squareSize + "%";
    
    SquareDiv.style.position = "absolute";
    SquareDiv.style.top = (7-rank)*squareSize + "%";
    SquareDiv.style.left = file*squareSize + "%";

    if (rank % 2 == file % 2)
        SquareDiv.classList.add("dark-square");
    else
        SquareDiv.classList.add("light-square");

    SquareDiv.addEventListener("click", function() { SelectSquare(this); } );

    ChessBoardDiv.appendChild(SquareDiv);
}