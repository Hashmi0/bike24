import { getCatalog } from "@/lib/catalog/catalog";
import { createOrderHandler } from "@/lib/orders/order-handler";
import { stockService } from "@/lib/stock/stock-service";

export const dynamic = "force-dynamic";

export const POST = createOrderHandler(stockService, getCatalog);
