import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./Level.css";
import Footer from "./Footer";
import Block from "./Block";
import levels from "./levels.js";
import ArrowKeysReact from "arrow-keys-react";

class Level extends Component {
  constructor(props) {
    super(props);

    this.state = {
      moves: 0,
      pushes: 0,
      time: "00:00:00",
      level: levels.filter(level => props.level == level.number)[0],
      diamonds: levels
        .filter(level => props.level == level.number)[0]
        .chart.filter(block => block.type.indexOf("diamond") >= 0)
    };

    ArrowKeysReact.config({
      left: () => {
        this.move("left");
      },
      right: () => {
        this.move("right");
      },
      up: () => {
        this.move("up");
      },
      down: () => {
        this.move("down");
      }
    });
  }

  move(direction) {
    let newLevel = this.state.level;

    // turn the man
    newLevel.chart.forEach(block => {
      if (block.type.indexOf("man-") >= 0) {
        block.type = `man-${direction}`;
      }
    });

    // move the man
    let currentManBlock = newLevel.chart.filter(
      block => block.type.indexOf("man-") >= 0
    )[0];
    if (
      this.isBlocked(currentManBlock.x, currentManBlock.y, direction) == false
    ) {
      newLevel.chart.forEach(block => {
        if (block.type.indexOf("man-") >= 0) {
          let newManBlock;
          switch (direction) {
            case "left":
              newManBlock = this.getBlock(
                currentManBlock.x - 1,
                currentManBlock.y
              );
              break;
            case "right":
              newManBlock = this.getBlock(
                currentManBlock.x + 1,
                currentManBlock.y
              );
              break;
            case "up":
              newManBlock = this.getBlock(
                currentManBlock.x,
                currentManBlock.y - 1
              );
              break;
            case "down":
              newManBlock = this.getBlock(
                currentManBlock.x,
                currentManBlock.y + 1
              );
              break;
            default:
              console.error("no direction provided for move");
          }

          if (newManBlock.type.indexOf("box") >= 0) {
            // move any blocks the man moved
            let newBoxBlock;
            switch (direction) {
              case "left":
                newBoxBlock = this.getBlock(newManBlock.x - 1, newManBlock.y);
                break;
              case "right":
                newBoxBlock = this.getBlock(newManBlock.x + 1, newManBlock.y);
                break;
              case "up":
                newBoxBlock = this.getBlock(newManBlock.x, newManBlock.y - 1);
                break;
              case "down":
                newBoxBlock = this.getBlock(newManBlock.x, newManBlock.y + 1);
                break;
              default:
                console.log("no direction to move box");
            }
            newBoxBlock.type = `box${
              newBoxBlock.type == "diamond" ? " diamond" : ""
            }`;
            this.state.pushes++;
          }

          block.type = "blank";

          newManBlock.type = `man-${direction}${
            newManBlock.type == "diamond" ? " diamond" : ""
          }`;
        }
      });

      this.state.moves++;
    } else {
      // move failed
    }

    // reset any diamonds that the man or blocks covered
    newLevel.chart.forEach(block => {
      this.state.diamonds.forEach(diamond => {
        if (
          block.type == "blank" &&
          (block.x == diamond.x && block.y == diamond.y)
        ) {
          block.type = "diamond";
        }
      });
    });

    this.setState({ level: newLevel });
    if (this.checkWin()) {
      console.log(`You beat level ${this.state.level.number}!`);
    }
  }

  checkWin() {
    return (
      this.state.level.chart.filter(block => block.type == "box diamond")
        .length +
        1 >=
      this.state.diamonds.length
    );
  }

  getBlock(x, y) {
    if (
      x > 0 &&
      x <= this.state.level.width &&
      y > 0 &&
      y < this.state.level.height
    ) {
      return this.state.level.chart.filter(
        block => block.x == x && block.y == y
      )[0];
    } else {
      return { type: "edge", x: x, y: y };
    }
  }

  isSolid(block) {
    return (
      block.type.indexOf("brick") >= 0 ||
      block.type.indexOf("box") >= 0 ||
      block.type.indexOf("edge") >= 0
    );
  }

  isBlocked(x, y, direction) {
    switch (direction) {
      case "left":
        // note: because of order of operations, if the closer block is not solid, this won’t check the farther one
        if (this.getBlock(x - 1, y).type == "brick") {
          return true;
        } else {
          return (
            this.isSolid(this.getBlock(x - 1, y)) &&
            this.isSolid(this.getBlock(x - 2, y))
          );
        }
      case "right":
        // note: because of order of operations, if the closer block is not solid, this won’t check the farther one
        if (this.getBlock(x + 1, y).type.indexOf("brick") >= 0) {
          return true;
        } else {
          return (
            this.isSolid(this.getBlock(x + 1, y)) &&
            this.isSolid(this.getBlock(x + 2, y))
          );
        }
      case "up":
        // note: because of order of operations, if the closer block is not solid, this won’t check the farther one
        if (this.getBlock(x, y - 1).type.indexOf("brick") >= 0) {
          return true;
        } else {
          return (
            this.isSolid(this.getBlock(x, y - 1)) &&
            this.isSolid(this.getBlock(x, y - 2))
          );
        }
      case "down":
        // note: because of order of operations, if the closer block is not solid, this won’t check the farther one
        if (this.getBlock(x, y + 1).type.indexOf("brick") >= 0) {
          return true;
        } else {
          return (
            this.isSolid(this.getBlock(x, y + 1)) &&
            this.isSolid(this.getBlock(x, y + 2))
          );
        }
      default:
        return `${direction} is unblocked, or you’re checking the edge of the map from ${x}, ${y}.`;
    }
  }

  componentDidMount() {
    this.gameMap.focus();
  }

  render() {
    // add ids for indexing
    this.state.level.chart.forEach((block, index) => {
      block.id = index;
    });

    return (
      <div
        className="Level"
        {...ArrowKeysReact.events}
        tabIndex="1"
        autoFocus={true}
        ref={c => (this.gameMap = c)}
      >
        <div
          className="chart"
          style={{
            width: this.state.level.width * 64
          }}
        >
          {this.state.level.chart.map(block => (
            <Block type={block.type} x={block.x} y={block.y} key={block.id} />
          ))}
        </div>
        <h2>
          <Link to={`/lobby`}>&lt;-- Back to Lobby</Link>
        </h2>
        <Footer
          level={this.props.level}
          moves={this.state.moves}
          pushes={this.state.pushes}
          time={this.state.time}
        />
      </div>
    );
  }
}

export default Level;
