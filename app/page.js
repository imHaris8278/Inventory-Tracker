"use client";
import {
  Box,
  Button,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { firestore } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCount, setItemCount] = useState(1);
  const [editItemName, setEditItemName] = useState("");
  const [editItemCount, setEditItemCount] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, "inventory"));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error("Error updating inventory: ", error);
    }
  };

  const addItem = async (item, count) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count: existingCount } = docSnap.data();
      await setDoc(docRef, { count: existingCount + count });
    } else {
      await setDoc(docRef, { count });
    }

    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    await deleteDoc(docRef);
    await updateInventory();
  };

  const handleEdit = async (item, newName, newCount) => {
    const itemRef = doc(collection(firestore, "inventory"), item);
    const newItemRef = doc(collection(firestore, "inventory"), newName);

    const itemSnap = await getDoc(itemRef);
    const newItemSnap = await getDoc(newItemRef);

    if (itemSnap.exists()) {
      const { count } = itemSnap.data();
      if (item !== newName) {
        if (!newItemSnap.exists()) {
          await deleteDoc(itemRef);
          await setDoc(newItemRef, { count: newCount });
        }
      } else {
        await setDoc(itemRef, { count: newCount });
      }
      await updateInventory();
    }
  };

  const increaseCount = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
      await updateInventory();
    }
  };

  const decreaseCount = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count > 1) {
        await setDoc(docRef, { count: count - 1 });
        await updateInventory();
      }
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => {
    setItemName("");
    setItemCount(1);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setCurrentItem(null);
    setEditItemName("");
    setEditItemCount(1);
  };

  const handleEditClick = (item) => {
    setCurrentItem(item.name);
    setEditItemName(item.name);
    setEditItemCount(item.count);
    setIsEditing(true);
    setOpen(true);
  };

  return (
    <Box
      height="100vh"
      width="100vw"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      p={2}
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={{ xs: 300, sm: 400 }}
          bgcolor="white"
          borderRadius={2}
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6">
            {isEditing ? "Edit Item" : "Add Item"}
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={isEditing ? editItemName : itemName}
              onChange={(e) => {
                isEditing
                  ? setEditItemName(e.target.value)
                  : setItemName(e.target.value);
              }}
            />
            <TextField
              type="number"
              variant="outlined"
              value={isEditing ? editItemCount : itemCount}
              onChange={(e) => {
                isEditing
                  ? setEditItemCount(Number(e.target.value))
                  : setItemCount(Number(e.target.value));
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                if (isEditing) {
                  handleEdit(currentItem, editItemName, editItemCount);
                } else {
                  addItem(itemName, itemCount);
                }
                handleClose();
              }}
              sx={{ backgroundColor: "blue", color: "white" }}
            >
              {isEditing ? "Edit" : "Add"}
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{ backgroundColor: "blue", color: "white" }}
      >
        Add New Item
      </Button>
      <Box
        width={{ xs: "100%", sm: "800px" }}
        border="1px solid #333"
        borderRadius={2}
        p={2}
      >
        <Box
          bgcolor="#ADD8E6"
          alignItems="center"
          justifyContent="center"
          display="flex"
          p={2}
        >
          <Typography variant="h2" color="#333">
            Inventory Items
          </Typography>
        </Box>
        <Stack spacing={2} mt={2}>
          {inventory.map(({ name, count }) => (
            <Box
              key={name}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              padding={2}
              borderRadius={2}
            >
              <Typography variant="h5" color="#333" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Box display="flex" alignItems="center">
                <IconButton
                  onClick={() => decreaseCount(name)}
                  sx={{ color: "gray" }}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography variant="h5" color="#333" textAlign="center">
                  {count}
                </Typography>
                <IconButton
                  onClick={() => increaseCount(name)}
                  sx={{ color: "gray" }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <Box>
                <IconButton
                  onClick={() => handleEditClick({ name, count })}
                  sx={{ color: "green" }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => removeItem(name)}
                  sx={{ color: "red" }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
