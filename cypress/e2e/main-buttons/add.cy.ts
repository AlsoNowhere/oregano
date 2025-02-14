import { time } from "../../data/timer.data";

describe("Main Buttons -- Add Button", () => {
  it("should have an Add Button", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");

    // // ** Act
    const addButton = cy.get("button#add-button");

    // ** Assert
    addButton.should("not.be.undefined");
  });

  it("should take the page to Manage when clicked", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");

    // ** Act
    const addButton = cy.get("button#add-button");
    addButton.click();
    cy.wait(time);

    // ** Assert
    cy.hash().should("eq", "#manage");
  });
});
