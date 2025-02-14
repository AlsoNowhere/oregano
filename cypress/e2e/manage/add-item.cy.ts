import { time } from "../../data/timer.data";

describe("Manage", () => {
  it("should add an item", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");
    const itemTitle = "goose";

    // ** Act
    cy.wait(time);

    const addButton = cy.get("button#add-button");
    addButton.click();

    cy.wait(time);

    const titleField = cy.get("#title-field");
    titleField.type(itemTitle);

    cy.wait(time);

    const form = cy.get("form[name=manage-form]");
    form.submit();

    cy.wait(time);

    // ** Assert
    const list = cy.get("#list");
    list.children.length === 1;
    const first = cy.get("#list li").first();
    first.should("include.text", itemTitle);
  });
});
