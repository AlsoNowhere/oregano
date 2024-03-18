export class Colour {
  colour: string;
  textColour: string;

  constructor(colour, textColour = "#fff") {
    this.colour = colour;
    this.textColour = textColour;
  }
}
