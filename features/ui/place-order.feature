@ui @regression @as-trader
Feature: Place Order

  Scenario Outline: Successfully place a limit <side> order
    When I place a limit "<side>" order
    Then I should see the order in the orders list
    When I view the order details
    And the order status should be "Pending Approval"

    Examples:
      | side |
      | buy  |
      | sell |

  @smoke
  Scenario: Cannot submit an order with missing price
    Given I navigate to the orders page
    When I attempt to place an order with no price
    Then the submit button should be disabled