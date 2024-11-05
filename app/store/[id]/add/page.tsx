"use client";
import { useForm, zodResolver } from "@mantine/form";
import { TimeInput } from "@mantine/dates";
import {
  TextInput,
  Textarea,
  Select,
  FileInput,
  Group,
  Button,
  Box,
  Paper,
  Title,
  Grid,
  Stack,
  Image,
  CloseButton,
  SimpleGrid,
  Text,
  ColorInput,
  Flex,
  Container,
  Card,
  Divider,
  ThemeIcon,
  rem,
  Tabs,
} from "@mantine/core";
import {
  IconBuilding,
  IconUpload,
  IconPhoto,
  IconUser,
  IconPhone,
  IconMail,
  IconClock,
  IconMapPin,
  IconPalette,
  IconPower,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { z } from "zod";
import { indianStates, swatches } from "@/lib/constants";
import { useParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import AddStoreForm from "./AddStoreForm";
import PreviewQR from "./PreviewQR";
import { PageHeader } from "@/components/common/PageHeader";
import WebPreview from "./WebPreview";

const storeSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  email: z.string().email("Invalid email address"),
  openTime: z.string().min(1, "Opening time is required"),
  closeTime: z.string().min(1, "Closing time is required"),
  address: z.string().min(10, "Please enter complete address"),
  themeColor: z.string().min(1, "Theme color is required"),
  storeLogo: z.any().optional(),
  storeImages: z.array(z.any()).optional(),
});

const StoreRegistration = () => {
  const form = useForm({
    validate: zodResolver(storeSchema),
    initialValues: {
      storeName: "",
      description: "",
      category: "",
      ownerName: "",
      phone: "",
      email: "",
      openTime: "",
      closeTime: "",
      address: "",
      themeColor: "#228be6", // Default theme color
      storeLogo: null,
      storeImages: [],
    },
  });

  const { id } = useParams();

  return (
    <Stack>
      {" "}
      <PageHeader title={`Create Store: Merchant name (${id}) `} />
      <div className="hidden md:block">
        <SimpleGrid cols={2}>
          <AddStoreForm form={form} />
          <Flex direction={"column"}>
            <Tabs defaultValue="qr">
              <Tabs.List mb={10}>
                <Tabs.Tab value="qr">Preview QR</Tabs.Tab>
                <Tabs.Tab value="website">Preview Website</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="qr" pb="xs">
                <PreviewQR storeInfo={form.values} />
              </Tabs.Panel>
              <Tabs.Panel value="website" pb="xs">
                <div className="relative">
                  <WebPreview />
                </div>
              </Tabs.Panel>
            </Tabs>
          </Flex>
        </SimpleGrid>
      </div>
      <div className="md:hidden block">
        <SimpleGrid cols={1}>
          <AddStoreForm form={form} />
          <PreviewQR storeInfo={form.values} />
        </SimpleGrid>
      </div>
    </Stack>
  );
};

export default StoreRegistration;
