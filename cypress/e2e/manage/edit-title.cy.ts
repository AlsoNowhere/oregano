import { addItem } from "../../services/add-item.service";

import { time } from "../../data/timer.data";

describe("Manage -- Edit title", () => {
  it("should have the first title on edit", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");
    const itemTitle = "goose";

    // ** Act
    addItem(itemTitle);

    cy.wait(time);

    const items = cy.get("#list > li");
    const first = items.first();
    const itemsButtons = first.find(".list-page__item-button");
    const editButton = itemsButtons.first();
    editButton.click();

    cy.wait(time);

    // ** Assert
    const titleField = cy.get("#title-field");
    titleField.should("have.value", itemTitle);
  });

  it("should edit the item title", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");
    const itemTitle = "goose";
    const newTitle = "lemon";

    // ** Act
    addItem(itemTitle);

    cy.wait(time);

    {
      const items = cy.get("#list > li");
      const first = items.first();
      const itemsButtons = first.find(".list-page__item-button");
      const editButton = itemsButtons.first();
      editButton.click();
    }

    cy.wait(time);

    const titleField = cy.get("input[name=title]");
    titleField.clear();
    titleField.type(newTitle);

    cy.wait(time);

    const form = cy.get("form[name=manage-form]");
    form.submit();

    cy.wait(time);

    // ** Assert
    const titleElement = cy.get(".list-page__title > h2");
    titleElement.should("include.text", newTitle);
  });
});
