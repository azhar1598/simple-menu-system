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
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { indianStates, swatches } from "@/lib/constants";
import { useParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import AddStoreForm from "./AddStoreForm";
import PreviewQR from "./PreviewQR";
import { PageHeader } from "@/components/common/PageHeader";
import WebPreview from "./WebPreview";
import PageMainWrapper from "@/components/common/PageMainWrapper";
import { useMutation, useQuery } from "@tanstack/react-query";
import callApi from "@/services/apiService";

const storeSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  tagline: z.string().min(5, "Description must be at least 10 characters"),
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
      name: "",
      categoryId: 1,
      tagLine: "",
      description:
        "We are dedicated to providing the best services to our customers. Your satisfaction is our priority.",
      logo: null,
      licenseId: "",
      address: "",
      state: "",
      pincode: "",
      city: "",
      latitude: "",
      longitude: "",
      storeUniqueId: "",
      qr: {
        titleFontSize: "24px",
        primaryColor: "#228be6",
        secondaryColor: "#ffffff",
        primaryText: "Scan Here",
        ctaText: "To View Our Menu",
        ctaColor: "#fab005",
        radius: 5,
      },
      website: {
        primaryColor: "#fab005",
        secondaryColor: "#091151",
      },
      businessHours: [{ openTime: "", closeTime: "", day: "" }],
      menuImages: [],
    },
  });

  const { id } = useParams();
  const objectToFormData = (
    obj: any,
    formData = new FormData(),
    parentKey = ""
  ) => {
    if (obj && typeof obj === "object" && !(obj instanceof File)) {
      Object.keys(obj).forEach((key) => {
        const fullKey = parentKey ? `${parentKey}[${key}]` : key;
        objectToFormData(obj[key], formData, fullKey);
      });
    } else {
      formData.append(parentKey, obj);
    }
    return formData;
  };

  const createStore = useMutation({
    mutationFn: async () => {
      const newFormValues = structuredClone(form.values);
      const onlyFiles = newFormValues.menuImages.map(
        (image: any) => image.file
      );
      newFormValues.menuImages = onlyFiles;
      const formData = objectToFormData(newFormValues);
      console.log("formData", formData);
      callApi.post(`/v1/merchants/${id}/stores`, formData);
    },
    onSuccess: async (res: any) => {
      const { data } = res;
      console.log("res", data);
      // router.push(`/stores`);
      // notification.success(`Store created successfully`);
    },
    onError: (err: Error) => {
      // notification.error(err);
      console.log(err.message);
    },
  });

  useEffect(() => {
    if (!id) return;
    form.setFieldValue("storeUniqueId", id);
  }, [id]);

  const getSingleMerchant = useQuery({
    queryKey: ["get-content-by-id"],
    queryFn: async () => {
      const response = await callApi.get(`/v1/merchants/${id}`);
      return response.data;
    },
  });

  return (
    <Stack>
      {" "}
      <PageHeader
        title={`Create Store: ${getSingleMerchant?.data?.data.name}`}
      />
      <div className="hidden md:block">
        {/* <SimpleGrid cols={1}> */}

        <AddStoreForm form={form} createStore={createStore} />

        {/* <Flex direction={"column"}>
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
          </Flex> */}
        {/* </SimpleGrid> */}
      </div>
      <div className="md:hidden block">
        <SimpleGrid cols={1}>
          <AddStoreForm form={form} createStore={createStore} />
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
                  <WebPreview storeInfo={form.values} />
                </div>
              </Tabs.Panel>
            </Tabs>
          </Flex>
        </SimpleGrid>
      </div>
    </Stack>
  );
};

export default StoreRegistration;
