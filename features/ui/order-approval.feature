@hybrid @as-trader
Feature: Order Approval (Hybrid)

  Scenario: Trader sees approval in real-time after backend action
    Given I navigate to the orders page
    And I have placed a new limit buy order
    When the order is approved via API
    And I reload the page
    Then the order status should be "Approved"