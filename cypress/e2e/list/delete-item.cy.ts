import { addItem } from "../../services/add-item.service";

import { time } from "../../data/timer.data";

describe("List -- delete item", () => {
  it("should delete the item", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");
    const itemTitle = "goose";

    // ** Act
    addItem(itemTitle);

    cy.wait(time);

    const cutButton = cy
      .get("#list > li")
      .first()
      .find(".list-page__item-button")
      .eq(2);
    cutButton.click();

    cy.wait(time);

    // ** Assert
    const items = cy.get("#list > li");
    items.should("have.length", 0);
  });
});
