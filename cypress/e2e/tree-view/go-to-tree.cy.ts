import { addItem } from "../../services/add-item.service";

import { time } from "../../data/timer.data";

describe("Tree -- go to tree", () => {
  it("should go to tree view", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");
    const itemTitle = "goose";

    // ** Act
    addItem(itemTitle);

    cy.wait(time);

    const treeButton = cy.get("button#tree-button");
    treeButton.click();

    cy.wait(time);

    // ** Assert
    cy.location("hash").should("eq", "#tree");

    const trees = cy.get(".pages .tree");
    trees.should("have.length", 1);

    const treeMessages = cy.get(".pages .tree .tree__message");
    treeMessages.should("have.length", 0);
  });

  it("should show messages too", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");
    const itemTitle = "goose";
    const itemMessage = "a certain extent";

    // ** Act
    addItem(itemTitle, itemMessage);

    cy.wait(time);

    const treeButton = cy.get("button#tree-button");
    treeButton.click();

    cy.wait(time);

    const showMessagesField = cy.get("input#show-messages-field");
    showMessagesField.click();

    cy.wait(time);

    // ** Assert
    const trees = cy.get(".pages .tree");
    trees.should("have.length", 1);

    const treeMessages = cy.get(".pages .tree .tree__message");
    treeMessages.should("have.length", 1);
  });
});
