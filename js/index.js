//possible ways to win
var win = [
  ["g1", "g2", "g3"],
  ["g1", "g4", "g7"],
  ["g7", "g8", "g9"],
  ["g3", "g6", "g9"],
  ["g1", "g5", "g9"],
  ["g3", "g5", "g7"],
  ["g2", "g5", "g8"],
  ["g4", "g5", "g6"]
];

//moves that haven't been played yet
var unplayedMoves = ['g1','g2','g3','g4','g5','g6','g7','g8','g9'];
//if computer wins, keep the winning array here
var gameWon = false;
var wonArray = [];
//moves played by computer
var computerMoves = [],
   //moves played by player
  playerMoves = [],
  //toggle  x and o
  xo = true,
    //next move to be played
  playNext,
    //variable used to store timer
  timeInterval,
    //used to update the UI
  element,
    //computer playing
  playing = false,
    //multiplayer or single player
  multiplayer = false,
    //these arrays are for multiplayer mode
    xArray = [], oArray = [];

//all possible states of the game
var states = {
  tie : 0,
  computerWin : 1,
  playerWin : 2,
  inPlay : 3 //no one has won or lost, game continues
};

//this function checks if the array 'moves' contains a winning sequence
function hasWon(moves){
  //loop through winning sequences and check if 'moves' contains one
  for(var i = 0;i < win.length;i++){
    //function every returns true only if all elements pass the test
    var result = win[i].every(function(val) {
      //does 'moves' contain val
      return moves.indexOf(val) >= 0;
    });
    //if a winning sequence is found, return true
    if(result == true)
      return true;
  }
  //no winning sequence found, return  false
  return false;
}

//get the list of winning moves
function getWinningArray(moves){
  //loop through winning sequences and check if 'moves' contains one
  for(var i = 0;i < win.length;i++){
    //function every returns true only if all elements pass the test
    var result = win[i].every(function(val) {
      //does 'moves' contain val
      return moves.indexOf(val) >= 0;
    });
    //if a winning sequence is found, return true
    if(result == true)
      return win[i];
  }
  return [];
}

//this function  checks the current game state
function boardStatus(comMoves,plMoves){
  var state;
  if(hasWon(comMoves))
    state = states.computerWin;
  else if(hasWon(plMoves))
    state = states.playerWin;
  //all moves have been played and no one won = a tie
  else if((comMoves.length + plMoves.length) == 9)
    state = states.tie;
  //no one won but spaces still left
  else
    state = states.inPlay;
  return state;
}

//get the current score of the board
function getScore(depth,isMaximizer,compMoves,plMoves,unplayed){
  
  /* termination conditions */
  var state = boardStatus(compMoves,plMoves);
  if(state == states.tie)
    return 0;
  else if(state == states.computerWin)
    //we subtract depth so that if a winning move takes longer, it will have a lower score
    return (10 - depth);
  else if(state == states.playerWin)
    //add depth so that if a losing move takes longer, it has a higher score
    return (-10 + depth);

  /* keep checking */
  var arr = [], map, nextMove, nextUnplayed, i,val;
  
  //our  computer is playing for the highest score
  if(isMaximizer){
    //loop through the unplayed moves
    for(i = 0 ; i < unplayed.length; i++){
      //copy the computer moves and add each new move subsequently in loop
      nextMove = compMoves.slice(0);
      nextMove.push(unplayed[i]);
      //copy unplayed moves, remove the current move being tested
      nextUnplayed = unplayed.slice(0);
      nextUnplayed.splice(nextUnplayed.indexOf(unplayed[i]),1);
      //get the score of the current move
      //depth+1 because we are going one step further
      val = getScore(depth+1,false,nextMove,plMoves,nextUnplayed);
      //add the result to array
      arr.push(val);
    }
    //find the maximum value in the array and return it
    var result = arr.reduce(function(prev,next){
      return prev > next ? prev : next;
    });
    return result;
  }
  //minimizer's turn
  //everything same as above but we are playing as  the player and finding  our minimum (player's maximum)
  else{
    for(i = 0 ; i < unplayed.length; i++){
      nextMove = plMoves.slice(0);
      nextMove.push(unplayed[i]);
      nextUnplayed = unplayed.slice(0);
      nextUnplayed.splice(nextUnplayed.indexOf(unplayed[i]),1);
      val = getScore(depth+1,true,compMoves,nextMove,nextUnplayed);
      arr.push(val);
    }
    //find minimum, return it
    var result = arr.reduce(function(prev,next){
      return prev < next ? prev : next;
    });
    return result;
  }
}

//get the next move to play
function getMove(){
  
  var nextMove, arr = [],unplayedTemp, compTemp;
  //loop through all unplayed moves
  for(var i = 0;i < unplayedMoves.length; i++){
    //this map will hold moves and their scores
    var map = {};
    //same as above, copy and append current move, copy and remove
    unplayedTemp = unplayedMoves.slice(0);
    unplayedTemp.splice(unplayedTemp.indexOf(unplayedMoves[i]),1);
    compTemp = computerMoves.slice(0);
    compTemp.push(unplayedMoves[i]);
    //set move to the current unplayed move
    map.move = unplayedMoves[i];
    //get the score of the current  move
    //we use false because the next move will be the minimizer
    map.score = getScore(0,false,compTemp,playerMoves,unplayedTemp);
    //add map to the array
    arr.push(map);
  }
  
  //get the maximum  value and return the move
  var result = arr.reduce(function(prev,next){
    return prev.score > next.score ? prev : next;
  });
  return result.move;
}

//reset game state
function playAgain(){
    
    gameWon = false;
      //moves that haven't been played yet
    unplayedMoves = ['g1','g2','g3','g4','g5','g6','g7','g8','g9'];

    //reset arrays
    computerMoves = [];
    playerMoves = [];
    xArray = [];
    oArray = [];
  //toggle  x and o
    xo = true;
    $('.grid').html('');
    //reset the background color for the won tiles
    wonArray.forEach(function(val){
          element = $("[value=" + val + "]");
          element.css('background-color','rgb(28,138,219)');
        });
    //reset
    wonArray = [];
  
    $('.play-again').fadeOut(1000);
    $(".play").fadeOut(1000, function(){
      $(".players-number").fadeIn(1000);  
    });
    
}

//play as computer
function play() {
    playing = true;
    //clear timer
    clearInterval(timeInterval);
    //get next move to play
    playNext = getMove();
  //add to played moves
    computerMoves.push(playNext);
  //remove from unplayed  moves
    unplayedMoves.splice(unplayedMoves.indexOf(playNext),1);
  //update UI
    element = $("[value=" + playNext + "]");
    if (xo) {
      element.html("X");
      xo = false;
    } else {
      element.html("O");
      xo = true;
    }
  
  //if computer has won
    wonArray = getWinningArray(computerMoves);
    if(wonArray.length > 0){
      gameWon = true;
      //change background color of tiles
      wonArray.forEach(function(val){
        element = $("[value=" + val + "]");
        element.css('background-color','rgb(158, 17, 54)');
      });
      $('.play-again').fadeIn(2000);
    }
    if(unplayedMoves.length == 0)
      $('.play-again').fadeIn(1000);
    playing = false;
}

function computerFirst(){
  $(".pick-first").fadeOut(1000, function(){
    $(".play").fadeIn(1000);
  });
  playing = true;
  timeInterval = setInterval("playFirst()", 2000);
}

function playerFirst(){
  $(".pick-first").fadeOut(1000, function(){
    $(".play").fadeIn(1000);
  });
}

//computer should play first
//this differs from play in that a random move is selected as the first move
//this saves a lot of time
function playFirst(){
  //clear timer
    clearInterval(timeInterval);
  //random number from 0 - 8
  var val = Math.floor(Math.random() * 9);
  //play, push to played moves
  playNext = unplayedMoves[val];
  computerMoves.push(playNext);
  //remove from unplayed  moves
  unplayedMoves.splice(unplayedMoves.indexOf(playNext),1);
  //Update the UI
  element = $("[value=" + playNext + "]");
    if (xo) {
      element.html("X");
      xo = false;
    } else {
      element.html("O");
      xo = true;
    }
  
  playing = false;
}

//one player mode
function onePlayer(){
  multiplayer = false;
  $(".players-number").fadeOut(1000, function(){
    $(".pick-first").fadeIn(1000);
  });
}

//two player mode
function twoPlayers(){
  multiplayer = true;
  $(".players-number").fadeOut(1000, function(){
    $(".play").fadeIn(1000);
  });
}

$(document).ready(function() {
  
  $(".grid").click(function() {
    //get value of current block
    var val = $(this).attr("value");
    //if the block has been played already, return
    //if computer is playing or the game has been won, return
    if (!(unplayedMoves.indexOf(val) >= 0) || gameWon || playing){
      return;
    }
    //1 player mode
    if(!multiplayer){
      //play the move
      if (xo) {
        $(this).html("X");
        xo = false;
      } else {
        $(this).html("O");
        xo = true;
      }

      //add to  played moves, remove from unplayed
      playerMoves.push(val);
      unplayedMoves.splice(unplayedMoves.indexOf(val),1);

      //if player has won
      wonArray = getWinningArray(playerMoves);
      if(wonArray.length > 0){
        gameWon = true;
        //change background color of tiles
        wonArray.forEach(function(val){
          element = $("[value=" + val + "]");
          element.css('background-color','rgb(55, 178, 94)');
        });
        $('.play-again').fadeIn(2000);
      }

      //no more moves to play
      if(unplayedMoves.length == 0)
        $('.play-again').fadeIn(1000);
      else{
        //give 2 second time delay before playing
        //playing variable prevents user from playing before computer is done
        playing = true;
        timeInterval = setInterval("play()", 2000);
      }
    }
    
    //2 player mode
    else{
      //play the move
      if (xo) {
        $(this).html("X");
        //add to  played moves, remove from unplayed
        xArray.push(val);
        unplayedMoves.splice(unplayedMoves.indexOf(val),1);

        //if player has won
        wonArray = getWinningArray(xArray);
        if(wonArray.length > 0){
          gameWon = true;
          //change background color of tiles
          wonArray.forEach(function(val){
            element = $("[value=" + val + "]");
            element.css('background-color','rgb(55, 178, 94)');
          });
          $('.play-again').fadeIn(2000);
        }
        xo = false;
      } else {
        $(this).html("O");
          //add to  played moves, remove from unplayed
        oArray.push(val);
        unplayedMoves.splice(unplayedMoves.indexOf(val),1);

        //if player has won
        wonArray = getWinningArray(oArray);
        if(wonArray.length > 0){
          gameWon = true;
          //change background color of tiles
          wonArray.forEach(function(val){
            element = $("[value=" + val + "]");
            element.css('background-color','rgb(55, 178, 94)');
          });
          $('.play-again').fadeIn(2000);
        }
        xo = true;
      }

      //no more moves to play
      if(unplayedMoves.length == 0)
        $('.play-again').fadeIn(1000);
    }
  });
  
});