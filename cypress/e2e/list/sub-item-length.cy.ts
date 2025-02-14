import { addItem } from "../../services/add-item.service";

import { time } from "../../data/timer.data";

describe("List -- sub items length", () => {
  it("should show sub items length", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");
    const itemTitle1 = "goose";
    const itemTitle2 = "plum";

    // ** Act
    addItem(itemTitle1);

    cy.wait(time);

    const items = cy.get("#list > li");
    const first = items.first();
    first.click();

    cy.wait(time);

    addItem(itemTitle2);

    cy.wait(time);

    const upToRoot = cy.get("#up-to-root");
    upToRoot.click();

    cy.wait(time);

    // ** Assert
    {
      const first = cy.get("#list li").first();
      const itemLength = first.find(".list-page__item-items_length > span");
      itemLength.should("exist");
      itemLength.should("have.text", "1");
    }
  });
});
