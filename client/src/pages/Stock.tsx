import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { InventoryItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Stock() {
  const { data: inventory, isLoading, refetch } = trpc.inventory.list.useQuery();
  const createInventoryMutation = trpc.inventory.create.useMutation();
  const updateInventoryMutation = trpc.inventory.update.useMutation();
  const deleteInventoryMutation = trpc.inventory.delete.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentInventoryItem, setCurrentInventoryItem] = useState<Partial<InventoryItem> | null>(null);

  const handleAddClick = () => {
    setCurrentInventoryItem({ name: "", category: "", quantity: 0, unit: "", price: 0, imageUrl: "" });
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: InventoryItem) => {
    setCurrentInventoryItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      try {
        await deleteInventoryMutation.mutateAsync({ id });
        toast.success("ลบรายการสำเร็จ");
        refetch();
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการลบรายการ");
        console.error("Error deleting inventory item:", error);
      }
    }
  };

  const handleSave = async () => {
    if (!currentInventoryItem?.name || !currentInventoryItem?.category || !currentInventoryItem?.unit || currentInventoryItem?.price === undefined) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      if (currentInventoryItem.id) {
        await updateInventoryMutation.mutateAsync(currentInventoryItem as InventoryItem);
        toast.success("อัปเดตรายการสำเร็จ");
      } else {
        await createInventoryMutation.mutateAsync(currentInventoryItem as Omit<InventoryItem, 'id'>);
        toast.success("เพิ่มรายการสำเร็จ");
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกรายการ");
      console.error("Error saving inventory item:", error);
    }
  };

  if (isLoading) {
    return <div className="p-4">กำลังโหลดคลังสินค้า...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">จัดการคลังวัตถุดิบ</h1>
      <Button onClick={handleAddClick} className="mb-4">เพิ่มวัตถุดิบใหม่</Button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">รูปภาพ</th>
              <th className="py-2 px-4 border-b">ชื่อวัตถุดิบ</th>
              <th className="py-2 px-4 border-b">หมวดหมู่</th>
              <th className="py-2 px-4 border-b">จำนวนคงเหลือ</th>
              <th className="py-2 px-4 border-b">หน่วย</th>
              <th className="py-2 px-4 border-b">ราคา/หน่วย</th>
              <th className="py-2 px-4 border-b">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {inventory?.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b text-center">
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-full mx-auto" />}
                </td>
                <td className="py-2 px-4 border-b">{item.name}</td>
                <td className="py-2 px-4 border-b">{item.category}</td>
                <td className="py-2 px-4 border-b text-center">{item.quantity}</td>
                <td className="py-2 px-4 border-b text-center">{item.unit}</td>
                <td className="py-2 px-4 border-b text-right">{item.price.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-center">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClick(item)}>แก้ไข</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(item.id)}>ลบ</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentInventoryItem?.id ? "แก้ไขวัตถุดิบ" : "เพิ่มวัตถุดิบใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">ชื่อวัตถุดิบ</Label>
              <Input
                id="name"
                value={currentInventoryItem?.name || ""}
                onChange={(e) => setCurrentInventoryItem({ ...currentInventoryItem, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">หมวดหมู่</Label>
              <Input
                id="category"
                value={currentInventoryItem?.category || ""}
                onChange={(e) => setCurrentInventoryItem({ ...currentInventoryItem, category: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">จำนวนคงเหลือ</Label>
              <Input
                id="quantity"
                type="number"
                value={currentInventoryItem?.quantity || 0}
                onChange={(e) => setCurrentInventoryItem({ ...currentInventoryItem, quantity: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">หน่วย</Label>
              <Input
                id="unit"
                value={currentInventoryItem?.unit || ""}
                onChange={(e) => setCurrentInventoryItem({ ...currentInventoryItem, unit: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">ราคา/หน่วย</Label>
              <Input
                id="price"
                type="number"
                value={currentInventoryItem?.price || 0}
                onChange={(e) => setCurrentInventoryItem({ ...currentInventoryItem, price: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">URL รูปภาพ</Label>
              <Input
                id="imageUrl"
                value={currentInventoryItem?.imageUrl || ""}
                onChange={(e) => setCurrentInventoryItem({ ...currentInventoryItem, imageUrl: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSave}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
