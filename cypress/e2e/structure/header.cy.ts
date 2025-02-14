import { time } from "../../data/timer.data";

describe("Should have a header", () => {
  it("should have a header", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");

    cy.wait(time);

    // ** Assert
    const header = cy.get("header.header");
    header.should("include.text", "Oregano");
  });
});
