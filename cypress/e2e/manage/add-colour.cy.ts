import { time } from "../../data/timer.data";

describe("Manage -- Choose colour", () => {
  it("should choose and add colour to new item", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");
    const itemTitle = "goose";
    const itemColour = "#3d7fe3";

    // ** Act
    cy.wait(time);

    const addButton = cy.get("button#add-button");
    addButton.click();

    cy.wait(time);

    const titleField = cy.get("#title-field");
    titleField.type(itemTitle);

    cy.wait(time);

    const colours = cy.get("#colour-field");
    const colour = colours.find(`[value="${itemColour}"]`);
    colour.click();

    cy.wait(time);

    const form = cy.get("form[name=manage-form]");
    form.submit();

    // ** Assert
    const list = cy.get("#list");
    list.children.length === 1;
    const first = cy.get("#list li").first();
    first.should("include.text", itemTitle);
    first
      .should("have.attr", "style")
      .and("include", `background-color: ${itemColour};`);
  });
});
