# Tariff Category System Documentation

## Overview

This system implements a comprehensive water tariff calculation system with support for:

- **DWASA Supply** (General water supply)
- **Tubewell Supply** (Alternative water source)
- Dynamic tariff calculations based on a configurable base category
- Automatic subsidy/earnings calculations

## Database Schema

### TariffCategory Entity

Stores individual tariff categories with their rates and ranges.

**Key Fields:**

- `slNo`: Serial number (immutable, DO NOT change)
- `categoryType`: Category type (e.g., "Lower middle (LM)")
- `category`: Main category (Domestic, Commercial, Government, Community)
- `name`: Display name
- `order`: Display order for sorting
- `rangeDescription`: Human-readable range (e.g., ">2500", "1501-2500")
- `lowerRange`, `upperRange`: Numeric ranges in square feet
- `dwasaMultiplicationFactor`: Multiplier for DWASA tariff calculation
- `dwasaProposedTariff`: Calculated tariff for DWASA supply (BDT/1000 L)
- `dwasaProposedSubsidyEarnings`: Subsidy or earnings for DWASA
- `tubewellMultiplicationFactor`: Multiplier for tubewell tariff
- `tubewellProposedTariff`: Calculated tariff for tubewell supply (BDT/1000 L)
- `isBaseCategory`: Whether this is the base category for calculations

### TariffCategorySettings Entity

Global settings for tariff calculations.

**Key Fields:**

- `baseCategoryId`: ID of the base category
- `productionCost`: Production cost P (BDT/1000L) - default: 40.0
- `baseRateA`: Base rate A (BDT/1000L) - default: 25.0
- `currentDwasaTariff`: Current DWASA tariff - default: 15.18
- `currentTubewellTariff`: Current tubewell tariff - default: 6.0
- `tubewellRatioStandard`: Standard tubewell ratio - default: 0.40 (40%)
- `tubewellRatioCommercial`: Commercial tubewell ratio - default: 0.60 (60%)
- `aboveBaseIncreasePercent`: Increase % for categories above base - default: 25
- `belowBaseDecreasePercent`: Decrease % for categories below base - default: 25
- `commercialIncreasePercent`: Fixed increase for commercial - default: 100
- `governmentIncreasePercent`: Fixed increase for government - default: 0

## Tariff Calculation Logic

### DWASA Supply (General Supply)

The tariff is calculated using the formula:

```
Tariff = Multiplication Factor × A
Subsidy/Earnings = P - (Multiplication Factor × A)
```

Where:

- **P** = Production Cost (e.g., 40.0 BDT/1000L)
- **A** = Base Rate (e.g., 25.0 BDT/1000L)
- **Multiplication Factor** varies by category:

#### For Domestic Categories:

- **Base Category**: Factor = 1.00
- **One level above base**: Factor = 1.25 (25% increase)
- **Two levels above base**: Factor = 1.50 (50% increase)
- **Three levels above base**: Factor = 1.75 (75% increase)
- **One level below base**: Factor = 0.75 (25% decrease)

#### For Special Categories:

- **Commercial**: Factor = 2.00 (100% increase, fixed)
- **Government**: Factor = 1.00 (0% increase, fixed)

**Example with default base "Lower middle (LM)":**

```
High (H):          1.75 × 25 = 43.75 BDT/1000L
Upper middle (UM): 1.50 × 25 = 37.50 BDT/1000L
Middle (M):        1.25 × 25 = 31.25 BDT/1000L
Lower middle (LM): 1.00 × 25 = 25.00 BDT/1000L (BASE)
LIC:               0.75 × 25 = 18.75 BDT/1000L
Commercial:        2.00 × 25 = 50.00 BDT/1000L (Fixed)
Government:        1.00 × 25 = 25.00 BDT/1000L (Fixed)
```

### Tubewell Supply

Tubewell tariff is calculated as a percentage of the base rate A:

```
Tubewell Tariff = Tubewell Ratio × A
```

**Ratios:**

- **Standard** (all categories except commercial): 40% of A
- **Commercial**: 60% of A

**Example:**

```
High (H):          0.70 × 25 = 17.50 BDT/1000L
Upper middle (UM): 0.60 × 25 = 15.00 BDT/1000L
Middle (M):        0.50 × 25 = 12.50 BDT/1000L
Lower middle (LM): 0.40 × 25 = 10.00 BDT/1000L
LIC:               0.30 × 25 = 7.50  BDT/1000L
Commercial:        1.20 × 25 = 30.00 BDT/1000L (60%)
Government:        0.40 × 25 = 10.00 BDT/1000L
```

## API Endpoints

### 1. Seed Initial Data

**POST** `/tariff-categories/seed`

Seeds the database with the 7 default categories from your Excel data.

```bash
curl -X POST http://localhost:3000/tariff-categories/seed
```

**Response:**

```json
{
  "message": "Initial tariff categories seeded successfully"
}
```

### 2. Get All Categories

**GET** `/tariff-categories`

Returns all tariff categories ordered by their order field.

```bash
curl http://localhost:3000/tariff-categories
```

### 3. Get Active Categories

**GET** `/tariff-categories/active`

Returns only active categories.

```bash
curl http://localhost:3000/tariff-categories/active
```

### 4. Get Settings

**GET** `/tariff-categories/settings/current`

Returns current tariff calculation settings.

```bash
curl http://localhost:3000/tariff-categories/settings/current
```

### 5. Update Settings

**PUT** `/tariff-categories/settings/update`

Updates global tariff settings.

```bash
curl -X PUT http://localhost:3000/tariff-categories/settings/update \
  -H "Content-Type: application/json" \
  -d '{
    "productionCost": 40.0,
    "baseRateA": 25.0,
    "aboveBaseIncreasePercent": 25,
    "belowBaseDecreasePercent": 25
  }'
```

### 6. Set Base Category

**POST** `/tariff-categories/settings/set-base-category/:categoryId`

Sets a specific category as the base for calculations.

```bash
# Set "Lower middle (LM)" (ID 4) as base
curl -X POST http://localhost:3000/tariff-categories/settings/set-base-category/4
```

### 7. Recalculate Tariffs

**POST** `/tariff-categories/recalculate`

Recalculates all tariffs based on current settings and base category.

```bash
curl -X POST http://localhost:3000/tariff-categories/recalculate
```

### 8. Create Category

**POST** `/tariff-categories`

Creates a new tariff category.

```bash
curl -X POST http://localhost:3000/tariff-categories \
  -H "Content-Type: application/json" \
  -d '{
    "slNo": 8,
    "categoryType": "Custom Category",
    "category": "Domestic",
    "name": "Custom Category",
    "order": 8,
    "rangeDescription": "Custom range",
    "dwasaIncreaseDecreasePercent": 25,
    "dwasaMultiplicationFactor": 1.0,
    "dwasaProposedTariff": 25.0,
    "dwasaProposedSubsidyEarnings": 15.0,
    "tubewellIncreaseDecreasePercent": 40,
    "tubewellMultiplicationFactor": 0.4,
    "tubewellProposedTariff": 10.0
  }'
```

### 9. Update Category

**PUT** `/tariff-categories/:id`

Updates an existing category. Note: `slNo` cannot be changed.

```bash
curl -X PUT http://localhost:3000/tariff-categories/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated High Category"
  }'
```

### 10. Delete Category

**DELETE** `/tariff-categories/:id`

Deletes a tariff category.

```bash
curl -X DELETE http://localhost:3000/tariff-categories/1
```

## Usage Workflow

### Initial Setup

1. **Seed the database:**

   ```bash
   POST /tariff-categories/seed
   ```

2. **Verify the seeded data:**

   ```bash
   GET /tariff-categories
   ```

3. **Check default settings:**
   ```bash
   GET /tariff-categories/settings/current
   ```

### Changing Base Category

If you want to change the base category (e.g., from "Lower middle" to "Middle"):

1. **Set new base category:**

   ```bash
   # Assuming "Middle (M)" has ID 3
   POST /tariff-categories/settings/set-base-category/3
   ```

2. **Recalculate all tariffs:**

   ```bash
   POST /tariff-categories/recalculate
   ```

3. **Verify updated tariffs:**
   ```bash
   GET /tariff-categories
   ```

### Adjusting Production Costs or Base Rate

1. **Update settings:**

   ```bash
   PUT /tariff-categories/settings/update
   {
     "productionCost": 45.0,  # Changed from 40.0
     "baseRateA": 30.0        # Changed from 25.0
   }
   ```

2. **Recalculate tariffs:**
   ```bash
   POST /tariff-categories/recalculate
   ```

### Adjusting Percentage Rules

To change the increase/decrease percentages:

```bash
PUT /tariff-categories/settings/update
{
  "aboveBaseIncreasePercent": 30,  # Changed from 25%
  "belowBaseDecreasePercent": 20,  # Changed from 25%
  "tubewellRatioStandard": 0.35,   # Changed from 40%
  "tubewellRatioCommercial": 0.65  # Changed from 60%
}
```

Then recalculate:

```bash
POST /tariff-categories/recalculate
```

## Category Ranges

The categories use household area in square feet:

| SL No | Category          | Range (sqf) | Description    |
| ----- | ----------------- | ----------- | -------------- |
| 1     | High (H)          | >2500       | 2501 and above |
| 2     | Upper middle (UM) | 1501-2500   | 1501 to 2500   |
| 3     | Middle (M)        | 1001-1500   | 1001 to 1500   |
| 4     | Lower middle (LM) | <1000       | 0 to 1000      |
| 5     | LIC               | -           | Tin shed       |
| 6     | Commercial        | -           | Not applicable |
| 7     | Government        | -           | Not applicable |

## Integration with User Bills

When calculating a user's water bill:

1. Determine the user's `accountType` (General/Tubewell)
2. Determine the user's category based on:
   - Household area (for domestic)
   - Category type (Commercial/Government)
3. Fetch the appropriate tariff from the category
4. Calculate bill: `Consumption (liters) × Tariff / 1000`

**Example:**

```typescript
// User with 5000 liters consumption, General supply, 1200 sqf home
// This falls in "Middle (M)" category

const category = await findCategoryByRange(1200); // Returns "Middle (M)"
const tariff = category.dwasaProposedTariff; // 31.25 BDT/1000L
const bill = (5000 / 1000) * tariff; // 5 × 31.25 = 156.25 BDT
```

## Notes

- **SL No is immutable**: Once set, it cannot be changed to maintain data integrity
- **Base category**: Changing the base category and recalculating will automatically adjust all other tariffs
- **Fixed rates**: Commercial and Government categories always use fixed rates regardless of base category
- **Tubewell exception**: Commercial has 60% ratio while all others use 40%

## Default Values

The system comes pre-configured with:

- Production Cost (P): 40.0 BDT/1000L
- Base Rate (A): 25.0 BDT/1000L
- Current DWASA Tariff: 15.18 BDT/1000L
- Current Tubewell Tariff: 6.0 BDT/1000L
- Base Category: Lower middle (LM)
- Above base increase: 25%
- Below base decrease: 25%
- Standard tubewell ratio: 40%
- Commercial tubewell ratio: 60%
- Commercial increase: 100%
- Government increase: 0%
